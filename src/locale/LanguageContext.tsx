import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { readStored, writeStored } from "@/lib/storage";
import { dictionaries, type Lang, type TranslationKey } from "./dictionaries";

const STORAGE_KEY = "halalmap-language";
const isLang = (v: string | null): v is Lang => v === "ko" || v === "en" || v === "uz";

function initialLang(): Lang {
  const saved = readStored(STORAGE_KEY);
  if (isLang(saved)) return saved;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return isLang(browser) ? browser : "en";
}

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Looks up a string; `{name}` placeholders are filled from `vars`. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStored(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({ lang, setLang, t: (key, vars) => {
        const template = dictionaries[lang][key];
        return vars ? template.replace(/\{(\w+)\}/g, (match, name: string) => String(vars[name] ?? match)) : template;
      },
    }),
    [lang, setLang],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
