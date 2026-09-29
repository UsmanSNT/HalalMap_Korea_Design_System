import React, { useEffect, useRef, useState } from "react";
import { StatusBar, BackButton } from "../components/Shared";
import { useLanguage } from "../i18n/LanguageContext";
import type { ScreenId } from "../App";
import { analyzeIngredients, getOcrConfig, runServerOcr, submitProduct, type Analysis } from "@/api/products";
import { extractIngredientSection, recognizeLabel } from "@/services/ocr";
import { imageToUploadDataUrl } from "@/services/imageUtils";
import { clearDraft, readDraft, saveDraft } from "@/services/scanHistory";
import { navigateTo, screenPath, useRouteParams } from "@/services/navigation";
import { DisclaimerNote, IngredientAnalysis, StatusBanner } from "./scanner/AnalysisView";

type Nav = { onNavigate?: (s: ScreenId) => void };

const Shell = ({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) => (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onBack={onBack} />
        <h1 className="font-bold text-lg flex-1">{title}</h1>
      </div>
    </div>
    <div className="flex-1 phone-scroll px-4 py-4 space-y-4">{children}</div>
  </div>
);

const primary = { backgroundColor: "var(--green)" } as const;

// ── Ingredient label photo → OCR → editable text → deterministic analysis ────────
type Phase = "start" | "reading" | "review";

export const IngredientScanScreen = ({ onNavigate }: Nav) => {
  const { t } = useLanguage();
  const barcode = useRouteParams().get("barcode") ?? "";
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<Blob | null>(null);
  const [phase, setPhase] = useState<Phase>("start");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [fromOcr, setFromOcr] = useState(false);
  const [edited, setEdited] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [markerFound, setMarkerFound] = useState(true);
  const [ocrFailed, setOcrFailed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisTrust, setAnalysisTrust] = useState<"confirmed" | "unconfirmed">("unconfirmed");
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const backTo = () => (barcode ? navigateTo(screenPath("scan-result", { barcode })) : onNavigate?.("scanner"));

  const onPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    photoRef.current = file;
    setPreview(URL.createObjectURL(file));
    setPhase("reading");
    setProgress(0);
    setAnalysis(null);
    setConfirmed(false);
    setEdited(false);
    setOcrFailed(false);
    try {
      let raw = "";
      let conf: number | null = null;
      const config = await getOcrConfig().catch(() => null);
      if (config?.serverProvider) {
        // An operator configured a server OCR provider: better accuracy, the photo is sent to the server.
        try {
          const result = await runServerOcr(await imageToUploadDataUrl(file, 2000, 0.85));
          raw = result.rawText;
          conf = result.confidence;
        } catch {
          raw = "";
        }
      }
      if (!raw) {
        const result = await recognizeLabel(file, (p) => setProgress(Math.round(p * 100)));
        raw = result.text;
        conf = result.confidence;
      }
      const extracted = extractIngredientSection(raw);
      setText(extracted.text || raw.trim());
      setMarkerFound(extracted.markerFound);
      setConfidence(conf);
      setFromOcr(true);
    } catch {
      setText("");
      setFromOcr(false);
      setOcrFailed(true);
    }
    setPhase("review");
  };

  const typeInstead = () => {
    setFromOcr(false);
    setOcrFailed(false);
    setConfidence(null);
    setText("");
    setPhase("review");
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const trust = confirmed ? "confirmed" : "unconfirmed";
      // OCR text is only ever cleared after the user says they compared it with the package.
      const input = fromOcr ? (confirmed ? "ocr_confirmed" : "ocr") : "typed";
      setAnalysis(await analyzeIngredients(text, input));
      setAnalysisTrust(trust);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const contribute = async () => {
    const image = photoRef.current ? await imageToUploadDataUrl(photoRef.current).catch(() => null) : null;
    saveDraft({ barcode, ingredientsText: text, ingredientsInput: fromOcr ? (edited ? "ocr_edited" : "ocr") : "typed", ocrConfidence: confidence, ingredientsImage: image });
    navigateTo(screenPath("product-submit", { barcode }));
  };

  const percent = Math.round((confidence ?? 0) * 100);

  return (
    <Shell title={t("scanner.ip_title")} onBack={backTo}>
      {barcode && <p className="text-xs font-mono text-[var(--muted)]">{t("scanner.ip_barcode").replace("{barcode}", barcode)}</p>}

      {phase === "start" && (
        <div className="space-y-3" data-testid="ip-start">
          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
            <p className="text-sm text-[#1A1A18] leading-relaxed">{t("scanner.ip_intro")}</p>
            <p className="text-xs text-[var(--muted)]">{t("scanner.ip_first_time")}</p>
          </div>
          <button onClick={() => fileRef.current?.click()} data-testid="ip-take-photo" className="w-full rounded-2xl py-4 font-bold text-white" style={primary}>{t("scanner.ip_take_photo")}</button>
          <button onClick={typeInstead} data-testid="ip-type" className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 text-sm font-semibold">{t("scanner.ip_type_instead")}</button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} data-testid="ip-file" />

      {phase === "reading" && (
        <div className="space-y-3 text-center" data-testid="ip-reading" role="status">
          {preview && <img src={preview} alt="" className="mx-auto max-h-56 rounded-2xl object-contain shadow-sm" />}
          <p className="text-sm text-[var(--muted)]">{t("scanner.ip_reading").replace("{percent}", String(progress))}</p>
          <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "var(--green)" }} /></div>
        </div>
      )}

      {phase === "review" && (
        <div className="space-y-3" data-testid="ip-review">
          {preview && <img src={preview} alt="" className="mx-auto max-h-40 rounded-2xl object-contain shadow-sm" />}
          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
            <p className="font-semibold text-sm">{t("scanner.ip_review_title")}</p>
            {fromOcr && <p className="text-xs text-[var(--muted)] leading-relaxed">{t("scanner.ip_review_hint")}</p>}
            {ocrFailed && <p className="text-xs text-red-700" role="alert">{t("scanner.ip_ocr_failed")}</p>}
            {fromOcr && !text.trim() && <p className="text-xs text-red-700" role="alert">{t("scanner.ip_no_text")}</p>}
            {fromOcr && text.trim() && !markerFound && <p className="text-xs text-[#7A5220]">{t("scanner.ip_marker_missing")}</p>}
            {fromOcr && confidence != null && (
              <p className="text-xs" style={{ color: percent < 70 ? "#92400E" : "var(--muted)" }}>
                {t("scanner.ip_confidence").replace("{percent}", String(percent))}{percent < 70 ? ` — ${t("scanner.ip_low_confidence")}` : ""}
              </p>
            )}
            <textarea
              value={text}
              data-testid="ip-text"
              onChange={(e) => { setText(e.target.value); setEdited(true); setConfirmed(false); setAnalysis(null); }}
              rows={7}
              placeholder={t("scanner.ip_text_placeholder")}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--cream)] p-3 text-sm leading-relaxed outline-none focus:border-[var(--green)]"
            />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={confirmed} data-testid="ip-confirm" onChange={(e) => { setConfirmed(e.target.checked); setAnalysis(null); }} className="mt-1 h-4 w-4 accent-green-700" />
              <span>{t("scanner.ip_confirm_check")}</span>
            </label>
            <div className="flex gap-2">
              <button onClick={analyze} disabled={!text.trim() || analyzing} data-testid="ip-analyze" className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40" style={primary}>{analyzing ? t("scanner.ip_analyzing") : t("scanner.ip_analyze")}</button>
              <button onClick={() => { setPhase("start"); setAnalysis(null); }} className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">{t("scanner.ip_retake")}</button>
            </div>
          </div>

          {analysis && (
            <div className="space-y-3" data-testid="ip-result" data-trust={analysisTrust}>
              <p className="px-1 text-xs font-semibold text-[var(--muted)]">{analysisTrust === "confirmed" ? t("scanner.ip_confirmed_result") : t("scanner.ip_unconfirmed_result")}</p>
              <StatusBanner analysis={analysis} />
              <IngredientAnalysis analysis={analysis} />
              <DisclaimerNote analysis={analysis} />
              <button onClick={contribute} data-testid="ip-contribute" className="w-full rounded-2xl border py-3.5 text-sm font-bold" style={{ color: "var(--green)", borderColor: "var(--green)" }}>{t("scanner.ip_contribute")}</button>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
};

// ── Contribute a missing product (stored as `pending`, reviewed by an admin) ─────
const PhotoField = ({ label, value, onChange, testId }: { label: string; value: string | null; onChange: (value: string | null) => void; testId: string }) => {
  const { t } = useLanguage();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="" className="h-20 w-20 rounded-xl object-cover" />
          <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-[var(--danger)]">{t("scanner.cs_remove")}</button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="w-full rounded-xl border border-dashed border-[var(--border)] bg-white py-3 text-sm font-semibold text-[var(--muted)]">📷 {t("scanner.cs_choose_photo")}</button>
      )}
      <input ref={ref} type="file" accept="image/*" data-testid={testId} className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onChange(await imageToUploadDataUrl(file).catch(() => null)); }} />
    </div>
  );
};

const input = "w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--green)]";

export const ProductSubmitScreen = ({ onNavigate }: Nav) => {
  const { t } = useLanguage();
  const paramBarcode = useRouteParams().get("barcode") ?? "";
  const [draft] = useState(readDraft);
  const [barcode, setBarcode] = useState(paramBarcode || draft.barcode || "");
  const [name, setName] = useState(draft.name ?? "");
  const [brand, setBrand] = useState(draft.brand ?? "");
  const [manufacturer, setManufacturer] = useState("");
  const [ingredients, setIngredients] = useState(draft.ingredientsText ?? "");
  const [note, setNote] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(draft.ingredientsImage ?? null);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<"form" | "sending" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [provisional, setProvisional] = useState<Analysis | null>(null);

  const back = () => (paramBarcode ? navigateTo(screenPath("scan-result", { barcode: paramBarcode })) : onNavigate?.("scanner"));

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!name.trim() && !ingredients.trim() && !productImage && !ingredientsImage) return setError(t("scanner.cs_need_something"));
    setState("sending");
    try {
      const input = draft.ingredientsInput && ingredients.trim() === (draft.ingredientsText ?? "").trim() ? draft.ingredientsInput : draft.ingredientsInput === "ocr" || draft.ingredientsInput === "ocr_edited" ? "ocr_edited" : "typed";
      const result = await submitProduct({
        barcode, name: name || undefined, brand: brand || undefined, manufacturer: manufacturer || undefined,
        ingredientsText: ingredients || undefined, ingredientsInput: input, ocrConfidence: draft.ocrConfidence ?? null,
        productImage, ingredientsImage, note: note || undefined, website: honeypot,
      });
      setProvisional(result.analysis);
      clearDraft();
      setState("done");
    } catch (e) {
      setError((e as Error).message && (e as { status?: number }).status === 400 ? (e as Error).message : t("scanner.cs_error"));
      setState("form");
    }
  };

  if (state === "done") {
    return (
      <Shell title={t("scanner.cs_title")} onBack={back}>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm space-y-2" data-testid="cs-success">
          <p className="text-4xl">🙏</p>
          <p className="font-bold text-lg">{t("scanner.cs_success_title")}</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{t("scanner.cs_success_desc")}</p>
          <span className="inline-block rounded-full bg-[var(--gold-light)] px-3 py-1 text-xs font-bold text-[#7A5220]">PENDING</span>
        </div>
        {provisional && (
          <div className="space-y-3">
            <p className="px-1 text-xs font-semibold text-[var(--muted)]">{t("scanner.cs_provisional")}</p>
            <StatusBanner analysis={provisional} />
          </div>
        )}
        <button onClick={() => onNavigate?.("scanner")} className="w-full rounded-2xl py-4 font-bold text-white" style={primary}>{t("scanner.cs_done")}</button>
      </Shell>
    );
  }

  return (
    <Shell title={t("scanner.cs_title")} onBack={back}>
      <p className="rounded-2xl bg-[var(--gold-light)] px-4 py-3 text-xs leading-relaxed text-[#7A5220]">{t("scanner.cs_intro")}</p>
      <form onSubmit={send} className="space-y-3" data-testid="cs-form">
        <div><label className="mb-1 block text-xs font-semibold text-[var(--muted)]" htmlFor="cs-barcode">{t("scanner.cs_barcode")}</label><input id="cs-barcode" data-testid="cs-barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} inputMode="numeric" required className={`${input} font-mono`} /></div>
        <div><label className="mb-1 block text-xs font-semibold text-[var(--muted)]" htmlFor="cs-name">{t("scanner.cs_name")}</label><input id="cs-name" data-testid="cs-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={input} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-xs font-semibold text-[var(--muted)]" htmlFor="cs-brand">{t("scanner.cs_brand")}</label><input id="cs-brand" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={80} className={input} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-[var(--muted)]" htmlFor="cs-maker">{t("scanner.cs_manufacturer")}</label><input id="cs-maker" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} maxLength={80} className={input} /></div>
        </div>
        <div><label className="mb-1 block text-xs font-semibold text-[var(--muted)]" htmlFor="cs-ingredients">{t("scanner.cs_ingredients")}</label><textarea id="cs-ingredients" data-testid="cs-ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={5} maxLength={4000} placeholder={t("scanner.ip_text_placeholder")} className={input} /></div>
        <PhotoField label={t("scanner.cs_product_photo")} value={productImage} onChange={setProductImage} testId="cs-product-photo" />
        <PhotoField label={t("scanner.cs_ingredients_photo")} value={ingredientsImage} onChange={setIngredientsImage} testId="cs-ingredients-photo" />
        <div><label className="mb-1 block text-xs font-semibold text-[var(--muted)]" htmlFor="cs-note">{t("scanner.cs_note")}</label><textarea id="cs-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} className={input} /></div>
        {/* honeypot: real users never see or fill this */}
        <input tabIndex={-1} autoComplete="off" aria-hidden value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
        {error && <p className="text-sm text-red-700" role="alert" data-testid="cs-error">{error}</p>}
        <button type="submit" disabled={state === "sending"} data-testid="cs-submit" className="w-full rounded-2xl py-4 font-bold text-white disabled:opacity-50" style={primary}>{state === "sending" ? t("scanner.cs_sending") : t("scanner.cs_submit")}</button>
      </form>
    </Shell>
  );
};
