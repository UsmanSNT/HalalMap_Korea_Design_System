// Deterministic ingredient/product classification.
//   ingredient text -> dictionary entry -> matching rules -> winning rule -> status + reason + evidence
// No AI, no scoring. The same input and the same rules always give the same output.
// Rules live in the database (ingredient_rules); this file only implements how rules are applied.

import { STATUS } from "./ruleset.mjs";
import { normalizeKey } from "../ingredients/normalize.mjs";

export const ENGINE_VERSION = "1.0.0";

export const PRODUCT_STATUS = Object.freeze({
  CERTIFIED: "HALAL_CERTIFIED",
  CLEARED: STATUS.CLEARED,
  CHECK: STATUS.CHECK,
  FLAGGED: STATUS.FLAGGED,
  UNKNOWN: STATUS.UNKNOWN,
});

const SEVERITY = { [STATUS.FLAGGED]: 3, [STATUS.CHECK]: 2, [STATUS.UNKNOWN]: 1, [STATUS.CLEARED]: 0 };
const worst = (a, b) => (SEVERITY[b.status] > SEVERITY[a.status] ? b : a);

// Messages produced by the engine itself (not by a rule). Wording only — no classification logic here.
const MESSAGES = {
  UNRECOGNIZED: {
    ko: "성분표에 있는 이 원료를 HalalMap 사전에서 찾을 수 없어 판단할 수 없습니다.",
    en: "This ingredient is not in the HalalMap dictionary, so it could not be classified.",
    uz: "Bu tarkibiy qism HalalMap lug'atida topilmadi, shuning uchun baholab bo'lmadi.",
  },
  UNCLASSIFIED: {
    ko: "사전에는 있지만 이 원료를 분류하는 규칙이 아직 없습니다.",
    en: "The ingredient is in the dictionary but no rule classifies it yet.",
    uz: "Tarkibiy qism lug'atda bor, lekin uni baholaydigan qoida hali yo'q.",
  },
  PARTIAL_MATCH_UNCONFIRMED: {
    ko: "원료명의 일부만 사전과 일치했습니다. 정확한 원료를 확인해 주세요.",
    en: "Only part of the ingredient name matched the dictionary. Please confirm the exact ingredient.",
    uz: "Tarkib nomining faqat bir qismi lug'atga mos keldi. Aniq tarkibni tekshiring.",
  },
  FUZZY_MATCH_UNCONFIRMED: {
    ko: "철자가 정확히 일치하지 않는 유사 항목으로 인식되었습니다(오탈자/OCR 오류 가능). 확인이 필요합니다.",
    en: "Matched to a similarly spelled dictionary entry (possible typo or OCR error). Confirmation is needed.",
    uz: "Imlosi o'xshash lug'at yozuviga mos keldi (xato yoki OCR xatosi bo'lishi mumkin). Tasdiqlash kerak.",
  },
  CHILDREN: {
    ko: "괄호 안에 표시된 세부 원료를 기준으로 판단했습니다.",
    en: "Classified by the sub-ingredients listed in brackets.",
    uz: "Qavs ichida ko'rsatilgan tarkibiy qismlar asosida baholandi.",
  },
};

const messageReason = (code) => ({ code, ...MESSAGES[code] });

const ruleReason = (rule) => ({ code: rule.reason_code, ko: rule.reason_ko, en: rule.reason_en, uz: rule.reason_uz });

const ruleView = (rule) => ({
  key: rule.rule_key,
  title: rule.title,
  matchType: rule.match_type,
  matchValue: rule.match_value,
  priority: rule.priority,
  status: rule.status,
  evidence: rule.evidence,
  evidenceUrl: rule.evidence_url,
  source: rule.source,
});

const ingredientView = (ingredient) =>
  ingredient
    ? {
        key: ingredient.key,
        canonicalName: ingredient.canonical_name,
        nameKo: ingredient.name_ko,
        nameEn: ingredient.name_en,
        category: ingredient.category,
        isClass: Boolean(ingredient.is_class),
      }
    : null;

/** Rules that apply to a node, best first: higher priority wins, then the stricter status. */
export const matchingRules = (node, ruleset) => {
  const matches = [];
  for (const rule of ruleset.rules) {
    if (rule.match_type === "ingredient") {
      if (node.ingredient && node.ingredient.key === rule.match_value) matches.push(rule);
    } else if (rule.match_type === "category") {
      if (node.ingredient && node.ingredient.category === rule.match_value) matches.push(rule);
    } else if (rule.match_type === "term") {
      if (rule.matchTerms.some((term) => node.key.includes(term))) matches.push(rule);
    }
  }
  return matches.sort(
    (a, b) => b.priority - a.priority || SEVERITY[b.status] - SEVERITY[a.status] || a.id - b.id,
  );
};

/** Evaluates a node on its own, ignoring its bracketed sub-ingredients. */
export const evaluateOwn = (node, ruleset) => {
  if (node.ignored) {
    return { status: STATUS.CLEARED, reason: null, rule: null, ignored: true, notes: ["ignored_by_admin"] };
  }
  const matches = matchingRules(node, ruleset);
  const notes = [];
  if (matches.length === 0) {
    const code = node.ingredient ? "UNCLASSIFIED" : "UNRECOGNIZED";
    return { status: STATUS.UNKNOWN, reason: messageReason(code), rule: null, matches, notes };
  }
  const winner = matches[0];
  let status = winner.status;
  let reason = ruleReason(winner);
  // A partial or spelling-tolerant match may never *clear* an ingredient. It can only raise a flag.
  if (status === STATUS.CLEARED && node.matchType === "contains") {
    status = STATUS.CHECK;
    reason = messageReason("PARTIAL_MATCH_UNCONFIRMED");
    notes.push("cleared_capped_partial_match");
  }
  if (status === STATUS.CLEARED && node.matchType === "fuzzy") {
    status = STATUS.CHECK;
    reason = messageReason("FUZZY_MATCH_UNCONFIRMED");
    notes.push("cleared_capped_fuzzy_match");
  }
  if (node.matchType === "fuzzy" && status !== STATUS.CLEARED) notes.push("fuzzy_match_unconfirmed");
  return { status, reason, rule: winner, matches, notes };
};

export const evaluateNode = (node, ruleset) => {
  const own = evaluateOwn(node, ruleset);
  const children = node.children.map((child) => evaluateNode(child, ruleset));

  let status = own.status;
  let reason = own.reason;
  let rule = own.rule ? ruleView(own.rule) : null;
  let derivedFromChildren = false;
  const adoptWorstChild = (worstChild) => {
    status = worstChild.status;
    reason = worstChild.reason;
    rule = worstChild.rule;
    derivedFromChildren = true;
  };

  if (children.length > 0) {
    const worstChild = children.reduce(worst);
    const isGrouping = node.ingredient ? Boolean(node.ingredient.is_class) : true;
    if (isGrouping) {
      // "유화제(대두레시틴)": the bracketed sub-ingredients say what the umbrella term really is.
      // The parent's own result only survives when it is a hard flag (e.g. a pork term in the name).
      if (own.status !== STATUS.FLAGGED) adoptWorstChild(worstChild);
    } else if (SEVERITY[worstChild.status] > SEVERITY[own.status]) {
      // "젤라틴(돈피)": a concrete ingredient stays as risky as its riskiest part.
      adoptWorstChild(worstChild);
    }
  }

  return {
    raw: node.raw,
    name: node.text,
    percent: node.percent,
    origin: node.origin,
    ingredient: ingredientView(node.ingredient),
    matchType: node.matchType,
    matchedAlias: node.matchedAlias,
    confidence: node.confidence,
    qualifiedBy: node.qualifiedBy,
    status,
    reason,
    rule,
    ruleMatches: (own.matches ?? []).slice(0, 4).map(ruleView),
    derivedFromChildren,
    derivedNote: derivedFromChildren ? messageReason("CHILDREN") : null,
    notes: own.notes ?? [],
    ignored: Boolean(own.ignored),
    children,
  };
};

const flatten = (results, out = []) => {
  for (const result of results) {
    if (result.ignored) continue;
    out.push(result);
    flatten(result.children, out);
  }
  return out;
};

const isCertificationValid = (cert, today) =>
  cert.verification_status === "verified" &&
  cert.status === "valid" &&
  (!cert.valid_until || cert.valid_until >= today) &&
  (!cert.valid_from || cert.valid_from <= today);

/** Splits certifications into the ones that count and the ones that are only claims/expired. */
export const evaluateCertifications = (certifications, today = new Date().toISOString().slice(0, 10)) => {
  const view = (cert, state) => ({
    id: cert.id,
    organization: cert.organization,
    certificateNo: cert.certificate_no,
    status: cert.status,
    validFrom: cert.valid_from,
    validUntil: cert.valid_until,
    verificationStatus: cert.verification_status,
    verificationUrl: cert.verification_url,
    verifiedAt: cert.verified_at,
    source: cert.source,
    sourceUrl: cert.source_url,
    license: cert.license,
    state,
  });
  const valid = [];
  const other = [];
  for (const cert of certifications) {
    if (isCertificationValid(cert, today)) valid.push(view(cert, "valid"));
    else if (cert.verification_status === "verified") other.push(view(cert, cert.status === "valid" ? "expired" : cert.status));
    else if (cert.verification_status === "rejected") continue;
    else other.push(view(cert, "unverified_claim"));
  }
  return { valid, other };
};

const DISCLAIMER = {
  ko: "이 결과는 원료명과 공개된 규칙에 따른 자동 확인이며 할랄 판정이나 인증이 아닙니다. 불확실하면 인증 기관 또는 제조사에 확인하세요.",
  en: "This is a rule-based check of the ingredient list, not a halal ruling or certification. When in doubt, ask the certifier or manufacturer.",
  uz: "Bu tarkib ro'yxatining qoidalarga asoslangan tekshiruvi, halol hukmi yoki sertifikat emas. Shubha bo'lsa, sertifikatlovchi yoki ishlab chiqaruvchidan so'rang.",
};

const text = (ko, en, uz) => ({ ko, en, uz });

/**
 * @param {object} args
 * @param {ReturnType<typeof evaluateNode>[]} args.results  evaluated top-level ingredients
 * @param {object[]} [args.certifications]  halal_certifications rows
 * @param {'verified_source'|'user_confirmed'|'ocr_unconfirmed'|'typed_unconfirmed'} [args.inputTrust]
 * @param {string[]} [args.dataWarnings]
 */
export const summarizeProduct = ({ results, certifications = [], inputTrust = "verified_source", dataWarnings = [], today, ruleset }) => {
  const all = flatten(results);
  const flagged = all.filter((r) => r.status === STATUS.FLAGGED && !r.derivedFromChildren);
  const checkRequired = all.filter((r) => r.status === STATUS.CHECK && !r.derivedFromChildren);
  const unknown = all.filter((r) => r.status === STATUS.UNKNOWN && !r.derivedFromChildren);
  const cleared = all.filter((r) => r.status === STATUS.CLEARED);

  const topLevel = results.filter((r) => !r.ignored);
  const reasons = [];
  let status;

  const certs = evaluateCertifications(certifications, today);
  const hasIngredients = topLevel.length > 0;
  const aggregate = hasIngredients ? topLevel.reduce(worst) : { status: STATUS.UNKNOWN };

  if (!hasIngredients) status = STATUS.UNKNOWN;
  else if (aggregate.status === STATUS.FLAGGED) status = STATUS.FLAGGED;
  else if (aggregate.status === STATUS.CHECK || aggregate.status === STATUS.UNKNOWN) status = STATUS.CHECK;
  else status = STATUS.CLEARED;

  // Text that came from OCR or was typed and never confirmed can only ever raise a flag, never clear a product.
  const untrusted = inputTrust !== "verified_source" && inputTrust !== "user_confirmed";
  if (untrusted && aggregate.status !== STATUS.FLAGGED && hasIngredients) {
    if (status === STATUS.CLEARED) status = STATUS.CHECK;
    reasons.push(
      inputTrust === "ocr_unconfirmed"
        ? {
            code: "OCR_UNCONFIRMED",
            text: text("사진에서 읽은 텍스트는 아직 확인되지 않아 '표시된 문제 없음'으로 처리할 수 없습니다. 원문과 대조해 확인해 주세요.",
              "Text read from a photo is not confirmed yet, so it cannot be reported as having no flagged ingredients. Please compare it with the label and confirm.",
              "Rasmdan o'qilgan matn hali tasdiqlanmagan, shuning uchun \"belgilangan tarkib topilmadi\" deb bo'lmaydi. Yorliq bilan solishtirib tasdiqlang."),
          }
        : { code: "INPUT_UNCONFIRMED", text: text("입력된 텍스트가 확인되지 않았습니다.", "The entered text is not confirmed.", "Kiritilgan matn tasdiqlanmagan.") },
    );
  }

  if (flagged.length) {
    const names = [...new Set(flagged.map((r) => r.name))].join(", ");
    reasons.push({ code: "HAS_FLAGGED", text: text(`표시된 원료가 있습니다: ${names}`, `Flagged ingredient(s) found: ${names}`, `Belgilangan tarkib topildi: ${names}`) });
  }
  if (checkRequired.length) {
    const names = [...new Set(checkRequired.map((r) => r.name))].join(", ");
    reasons.push({ code: "HAS_CHECK_REQUIRED", text: text(`출처·제조방식 확인이 필요한 원료: ${names}`, `Ingredient(s) whose source or process must be checked: ${names}`, `Manbasi yoki ishlab chiqarish usuli tekshirilishi kerak bo'lgan tarkib: ${names}`) });
  }
  if (unknown.length) {
    const names = [...new Set(unknown.map((r) => r.name))].join(", ");
    reasons.push({ code: "HAS_UNKNOWN", text: text(`분류할 수 없는 원료: ${names}`, `Ingredient(s) that could not be classified: ${names}`, `Baholab bo'lmagan tarkib: ${names}`) });
  }

  // Certification: only a verified, valid, unexpired certificate can produce HALAL_CERTIFIED.
  let certification = { state: "none", valid: certs.valid, other: certs.other };
  if (certs.valid.length > 0) {
    const cert = certs.valid[0];
    certification.state = "valid";
    if (status === STATUS.FLAGGED) {
      status = STATUS.CHECK;
      reasons.unshift({
        code: "CERT_CONFLICT",
        text: text("할랄 인증 정보와 표시된 원료가 충돌합니다. 관리자 확인이 필요합니다.",
          "The halal certification conflicts with a flagged ingredient. Manual review is needed.",
          "Halol sertifikati bilan belgilangan tarkib o'rtasida ziddiyat bor. Qo'lda tekshirish kerak."),
      });
    } else {
      status = PRODUCT_STATUS.CERTIFIED;
      const until = cert.validUntil ? ` (${cert.validUntil})` : "";
      reasons.unshift({
        code: "CERT_VALID",
        text: text(`${cert.organization}의 확인된 할랄 인증이 있습니다${until}.`,
          `Verified halal certification by ${cert.organization}${until}.`,
          `${cert.organization} tomonidan tasdiqlangan halol sertifikati mavjud${until}.`),
      });
    }
  } else if (certs.other.length > 0) {
    certification.state = certs.other.some((c) => c.state === "unverified_claim") ? "unverified_claim" : "expired";
  }

  if (status === STATUS.CLEARED) {
    reasons.unshift({
      code: "ALL_MATCHED_NO_FLAGS",
      text: text(`성분표의 ${all.length}개 항목이 모두 검토된 사전 항목과 일치했고 표시된 원료는 없습니다. 이는 할랄 인증이 아닙니다.`,
        `All ${all.length} listed items matched reviewed dictionary entries and none is flagged. This is not a halal certification.`,
        `Ro'yxatdagi ${all.length} ta tarkibning barchasi ko'rib chiqilgan lug'at yozuviga mos keldi va belgilangani yo'q. Bu halol sertifikati emas.`),
    });
  }
  if (status === STATUS.UNKNOWN) {
    reasons.unshift({
      code: "NO_INGREDIENT_DATA",
      text: text("이 제품의 원재료 정보가 없어 분석할 수 없습니다.", "No ingredient information is available for this product.", "Bu mahsulot uchun tarkib ma'lumoti yo'q, tahlil qilib bo'lmadi."),
    });
  }

  return {
    status,
    reasons,
    certification,
    counts: { total: all.length, flagged: flagged.length, checkRequired: checkRequired.length, unknown: unknown.length, cleared: cleared.length },
    items: results.filter((r) => !r.ignored),
    flagged,
    checkRequired,
    unknown,
    cleared,
    inputTrust,
    dataWarnings,
    engineVersion: ENGINE_VERSION,
    rulesetVersion: ruleset?.version ?? null,
    disclaimer: DISCLAIMER,
  };
};

/** Classifies a single free-text term with the rules — used by the admin "rule tester" and ingredient cache refresh. */
export const explainText = (textValue, ruleset, resolve) => {
  const resolved = resolve(textValue);
  const node = {
    raw: textValue,
    text: textValue,
    key: normalizeKey(textValue),
    percent: null,
    origin: null,
    ingredient: resolved?.ingredient ?? null,
    matchType: resolved?.matchType ?? "unmatched",
    confidence: resolved?.confidence ?? 0,
    matchedAlias: resolved?.alias ?? null,
    qualifiedBy: null,
    children: [],
  };
  return evaluateNode(node, ruleset);
};
