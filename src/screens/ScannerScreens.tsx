import React, { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, BackButton } from "../components/Shared";
import { useLanguage } from "../i18n/LanguageContext";
import type { ScreenId } from "../App";
import { lookupProduct, type LookupResult } from "@/api/products";
import { acceptableBarcode } from "@/services/barcode";
import { decodeBarcodeFromFile, startCameraScan, type ScannerHandle } from "@/services/scanner";
import { addScanHistory, clearScanHistory, readScanHistory, saveDraft, type ScanHistoryItem } from "@/services/scanHistory";
import { navigateTo, screenPath, useRouteParams } from "@/services/navigation";
import { STATUS_STYLE, CertificationCard, DisclaimerNote, IngredientAnalysis, SourceCard, StatusBanner } from "./scanner/AnalysisView";

type Nav = { onNavigate?: (s: ScreenId) => void };

const openResult = (barcode: string) => navigateTo(screenPath("scan-result", { barcode }));

// ── 22. Scanner Screen ─────────────────────────────────────────────────────────
type CameraState = "starting" | "scanning" | "denied" | "unavailable" | "error";

export const ScannerScreen = ({ onNavigate }: Nav) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<ScannerHandle | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<CameraState>("starting");
  const [attempt, setAttempt] = useState(0);
  const [torch, setTorch] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [manual, setManual] = useState("");
  const [manualError, setManualError] = useState(false);
  const [gallery, setGallery] = useState<"idle" | "decoding" | "none">("idle");
  const [mode, setMode] = useState<string | null>(null);
  const [history] = useState<ScanHistoryItem[]>(() => readScanHistory());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    setCamera("starting");
    startCameraScan(video, (event) => {
      navigator.vibrate?.(60);
      handleRef.current?.stop();
      openResult(event.code);
    })
      .then((handle) => {
        if (cancelled) return handle.stop();
        handleRef.current = handle;
        setMode(handle.mode);
        setTorchSupported(handle.torchSupported);
        setCamera("scanning");
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setCamera(error.name === "NotAllowedError" || error.name === "SecurityError" ? "denied" : error.name === "NotSupportedError" ? "unavailable" : "error");
      });
    return () => {
      cancelled = true;
      handleRef.current?.stop();
      handleRef.current = null;
    };
  }, [attempt]);

  const submitManual = (event: React.FormEvent) => {
    event.preventDefault();
    const code = acceptableBarcode(manual);
    if (!code) return setManualError(true);
    handleRef.current?.stop();
    openResult(code);
  };

  const onGallery = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setGallery("decoding");
    try {
      const found = await decodeBarcodeFromFile(file);
      if (found) {
        handleRef.current?.stop();
        return openResult(found.code);
      }
      setGallery("none");
    } catch {
      setGallery("none");
    }
  };

  const toggleTorch = async () => {
    const next = !torch;
    if (await handleRef.current?.setTorch(next)) setTorch(next);
  };

  const cameraMessage = camera === "denied" ? t("scanner.camera_denied") : camera === "unavailable" ? t("scanner.camera_unavailable") : camera === "error" ? t("scanner.camera_error") : null;
  const recent = history[0];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#0A0A0A" }} data-testid="scanner-screen" data-camera={camera} data-mode={mode ?? ""}>
      <StatusBar dark />

      <div className="flex items-center justify-between px-5 pb-3 relative z-20 flex-shrink-0">
        <BackButton dark onBack={() => onNavigate?.("home")} />
        <h1 className="font-bold text-white text-lg">{t("scanner.title")}</h1>
        {torchSupported ? (
          <button onClick={toggleTorch} aria-label={t("scanner.torch")} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: torch ? "#FCD34D" : "rgba(255,255,255,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill={torch ? "#1A1A18" : "white"}><path d="M10 1L4 10h5l-1 7 7-10h-5L10 1z" /></svg>
          </button>
        ) : <span className="w-9" />}
      </div>

      {/* Camera */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 300 }}>
        <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" data-testid="camera-video" />
        {camera !== "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center" style={{ backgroundColor: "#111" }}>
            {camera === "starting" ? (
              <p className="text-sm text-white/70">{t("scanner.camera_starting")}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-white/80 leading-relaxed">{cameraMessage}</p>
                <button onClick={() => setAttempt((n) => n + 1)} className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white">{t("scanner.retry_camera")}</button>
              </div>
            )}
          </div>
        )}
        {camera === "scanning" && (
          <>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 260px 130px at center, transparent 0%, rgba(0,0,0,0.6) 100%)" }} />
            <div className="absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {["top-0 left-0 border-t-[3px] border-l-[3px]", "top-0 right-0 border-t-[3px] border-r-[3px]", "bottom-0 left-0 border-b-[3px] border-l-[3px]", "bottom-0 right-0 border-b-[3px] border-r-[3px]"].map((c) => (
                <div key={c} className={`absolute h-7 w-7 border-white ${c}`} />
              ))}
              <div className="absolute left-2 right-2 h-0.5 animate-scan-beam" style={{ background: "linear-gradient(90deg, transparent, #34d399, transparent)", boxShadow: "0 0 8px 2px rgba(52,211,153,0.6)", top: 4 }} />
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 space-y-3" style={{ minHeight: 0 }}>
        <p className="text-center text-sm font-medium text-white/85">{t("scanner.instructions")}</p>
        <p className="text-center text-[11px] text-white/45">{t("scanner.formats_note")}</p>

        <form onSubmit={submitManual} className="rounded-2xl bg-white/10 p-3 space-y-2">
          <label htmlFor="manual-barcode" className="text-xs font-semibold text-white/80">{t("scanner.manual_title")}</label>
          <div className="flex gap-2">
            <input
              id="manual-barcode"
              data-testid="manual-barcode"
              value={manual}
              onChange={(e) => { setManual(e.target.value); setManualError(false); }}
              inputMode="numeric"
              autoComplete="off"
              placeholder={t("scanner.manual_placeholder")}
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-sm text-[#1A1A18] outline-none"
            />
            <button type="submit" data-testid="manual-submit" className="rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("scanner.manual_submit")}</button>
          </div>
          {manualError && <p className="text-xs text-red-300" role="alert">{t("scanner.manual_invalid")}</p>}
        </form>

        <div className="flex gap-2">
          <button onClick={() => galleryRef.current?.click()} className="flex-1 rounded-2xl border border-white/20 py-3 text-sm font-semibold text-white">
            {gallery === "decoding" ? t("scanner.gallery_decoding") : t("scanner.choose_from_gallery")}
          </button>
          <button onClick={() => navigateTo("ingredient-scan")} className="flex-1 rounded-2xl border border-white/20 py-3 text-sm font-semibold text-white" data-testid="goto-ingredient-scan">
            {t("scanner.goto_ingredient_scan")}
          </button>
        </div>
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onGallery} data-testid="gallery-input" />
        {gallery === "none" && <p className="text-xs text-amber-200" role="alert">{t("scanner.gallery_not_found")}</p>}

        {recent ? (
          <button onClick={() => openResult(recent.barcode)} className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">{recent.imageUrl && <img src={recent.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-white/60">{t("scanner.recent_scan_label")}</p>
              <p className="truncate text-sm font-semibold text-white">{recent.name}</p>
            </div>
            <span className="rounded-full px-2 py-1 text-[9px] font-extrabold" style={{ backgroundColor: STATUS_STYLE[recent.status as keyof typeof STATUS_STYLE]?.bg, color: STATUS_STYLE[recent.status as keyof typeof STATUS_STYLE]?.color }}>{STATUS_STYLE[recent.status as keyof typeof STATUS_STYLE]?.token.split(" ").slice(0, 2).join(" ")}</span>
          </button>
        ) : <p className="text-center text-xs text-white/40">{t("scanner.no_history")}</p>}
        <button onClick={() => navigateTo("scan-history")} className="w-full py-2 text-center text-xs font-semibold text-white/60">{t("scanner.open_history")}</button>
      </div>
    </div>
  );
};

// ── 23. Scan Result ────────────────────────────────────────────────────────────
type Load = { state: "loading" } | { state: "error" } | { state: "done"; result: LookupResult };

export const ScanResultScreen = ({ onNavigate }: Nav) => {
  const { t, lang } = useLanguage();
  const barcode = useRouteParams().get("barcode") ?? "";
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [showList, setShowList] = useState(false);

  const run = useCallback(() => {
    let cancelled = false;
    setLoad({ state: "loading" });
    lookupProduct(barcode)
      .then((result) => {
        if (cancelled) return;
        setLoad({ state: "done", result });
        if (result.found) {
          addScanHistory({
            barcode: result.barcode, name: result.product.nameKo ?? result.product.name, brand: result.product.brand,
            status: result.analysis.status, imageUrl: result.product.imageUrl,
          });
        }
      })
      .catch(() => { if (!cancelled) setLoad({ state: "error" }); });
    return () => { cancelled = true; };
  }, [barcode]);

  useEffect(() => (barcode ? run() : undefined), [barcode, run]);

  const contribute = () => {
    if (load.state === "done" && load.result.found) {
      saveDraft({ barcode: load.result.barcode, name: load.result.product.name, brand: load.result.product.brand ?? undefined, ingredientsText: load.result.product.ingredientsRaw ?? undefined, ingredientsInput: "typed" });
    } else saveDraft({ barcode });
    navigateTo(screenPath("product-submit", { barcode }));
  };
  const ingredientPhoto = () => navigateTo(screenPath("ingredient-scan", { barcode }));

  const header = (
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onBack={() => onNavigate?.("scanner")} />
        <h1 className="font-bold text-lg flex-1">{t("scanner.scan_result_title")}</h1>
      </div>
    </div>
  );

  if (!barcode) {
    return <div className="flex h-full flex-col bg-[var(--cream)]">{header}<div className="p-6"><button onClick={() => onNavigate?.("scanner")} className="w-full rounded-2xl py-4 font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("scanner.scan_again")}</button></div></div>;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]" data-testid="scan-result" data-state={load.state === "done" ? (load.result.found ? "found" : "not-found") : load.state}>
      {header}
      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {load.state === "loading" && <p className="py-12 text-center text-sm text-[var(--muted)]" role="status">{t("scanner.looking_up")}</p>}

        {load.state === "error" && (
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm space-y-3" role="alert">
            <p className="text-sm text-[#1A1A18]">{t("scanner.lookup_error")}</p>
            <button onClick={run} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("scanner.retry")}</button>
          </div>
        )}

        {load.state === "done" && !load.result.found && (
          <div className="space-y-3" data-testid="not-found">
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-2">
              <p className="text-xs text-[var(--muted)] font-mono">{t("scanner.barcode_label")} {load.result.barcode}</p>
              <p className="font-bold text-base text-[#1A1A18]">{t("scanner.not_found_title")}</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{t("scanner.not_found_desc")}</p>
              {load.result.pendingSubmission && <p className="rounded-lg bg-[var(--gold-light)] px-3 py-2 text-xs text-[#7A5220]">{t("scanner.pending_contribution")}</p>}
            </div>
            <button onClick={ingredientPhoto} data-testid="action-ingredient-photo" className="w-full rounded-2xl py-4 font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("scanner.action_ingredient_photo")}</button>
            <button onClick={contribute} data-testid="action-contribute" className="w-full rounded-2xl border py-4 font-bold" style={{ color: "var(--green)", borderColor: "var(--green)" }}>{t("scanner.action_contribute")}</button>
          </div>
        )}

        {load.state === "done" && load.result.found && (() => {
          const { product, analysis } = load.result;
          const name = lang === "en" ? product.nameEn ?? product.name : product.nameKo ?? product.name;
          const hasIngredients = analysis.counts.total > 0;
          return (
            <>
              <div className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm" data-testid="product-card">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#E8E6E1] flex-shrink-0 flex items-center justify-center text-3xl">
                  {product.imageUrl ? <img src={product.imageUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span aria-hidden>📦</span>}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  {product.brand && <p className="text-xs text-[var(--muted)]">{product.brand}</p>}
                  <p className="font-bold text-base text-[#1A1A18] leading-tight" data-testid="product-name">{name}</p>
                  {product.nameEn && product.nameKo && lang === "ko" && product.nameEn !== product.nameKo && <p className="text-xs text-[var(--muted)]">{product.nameEn}</p>}
                  {product.manufacturer && <p className="text-xs text-[var(--muted)] mt-0.5">{product.manufacturer}</p>}
                  <p className="text-xs text-[var(--muted)] mt-1 font-mono">{load.result.barcode}</p>
                </div>
              </div>

              <StatusBanner analysis={analysis} />
              <CertificationCard analysis={analysis} />

              {hasIngredients ? <IngredientAnalysis analysis={analysis} /> : (
                <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
                  <p className="font-semibold text-sm">{t("scanner.no_ingredients_title")}</p>
                  <p className="text-xs text-[var(--muted)]">{t("scanner.no_ingredients_desc")}</p>
                  <button onClick={ingredientPhoto} data-testid="action-ingredient-photo" className="w-full rounded-xl py-3 text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("scanner.action_ingredient_photo")}</button>
                </div>
              )}

              {product.ingredientsRaw && (
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <button onClick={() => setShowList(!showList)} className="flex w-full items-center justify-between text-sm font-semibold">
                    <span>{t("scanner.ingredients_full")}</span><span>{showList ? "▴" : "▾"}</span>
                  </button>
                  {showList && <p className="mt-2 text-xs leading-relaxed text-[#374151] break-words" data-testid="ingredients-raw">{product.ingredientsRaw}</p>}
                  {analysis.parse.allergens.length > 0 && <p className="mt-2 text-xs text-[var(--muted)]"><span className="font-semibold">{t("scanner.allergens_title")}:</span> {analysis.parse.allergens.join(", ")}</p>}
                </div>
              )}

              <SourceCard product={product} analysis={analysis} />
              <DisclaimerNote analysis={analysis} />

              {load.result.pendingSubmission && <p className="rounded-lg bg-[var(--gold-light)] px-3 py-2 text-xs text-[#7A5220]">{t("scanner.pending_contribution")}</p>}
              <button onClick={contribute} className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 text-sm font-semibold text-[var(--muted)]">{t("scanner.report_error")}</button>
            </>
          );
        })()}

        <button onClick={() => onNavigate?.("scanner")} className="w-full py-4 rounded-2xl font-bold text-white text-base" style={{ backgroundColor: "var(--green)" }} data-testid="scan-again">{t("scanner.scan_again")}</button>
        <button onClick={() => navigateTo("scan-history")} className="w-full py-2 text-center text-sm font-semibold text-[var(--muted)]">{t("scanner.open_history")}</button>
        <div className="h-2" />
      </div>
    </div>
  );
};

// ── 24. Scan History ───────────────────────────────────────────────────────────
export const ScanHistoryScreen = ({ onNavigate }: Nav) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<ScanHistoryItem[]>(() => readScanHistory());

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("scanner")} />
          <h1 className="font-bold text-lg flex-1">{t("scanner.history_title")}</h1>
          {items.length > 0 && <button onClick={() => { clearScanHistory(); setItems([]); }} className="text-sm font-medium" style={{ color: "var(--danger)" }}>{t("scanner.clear_all")}</button>}
        </div>
      </div>
      <div className="flex-1 phone-scroll px-4 py-4 space-y-2.5">
        {items.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted)]">{t("scanner.no_history")}</p>}
        {items.map((item) => {
          const style = STATUS_STYLE[item.status as keyof typeof STATUS_STYLE];
          return (
            <button key={item.barcode} onClick={() => openResult(item.barcode)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl" style={{ backgroundColor: style?.bg ?? "#F3F4F6" }}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <span aria-hidden>📦</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1A1A18]">{item.name}</p>
                <p className="text-xs text-[var(--muted)]">{[item.brand, new Date(item.at).toLocaleDateString()].filter(Boolean).join(" · ")}</p>
              </div>
              {style && <span className="flex-shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold tracking-wide" style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}>{style.token.split(" ").slice(0, 2).join(" ")}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
