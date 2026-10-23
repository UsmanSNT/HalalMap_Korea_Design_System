import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/locale/LanguageContext";
import ActionButton from "./ActionButton";
import { CheckIcon, CopyIcon } from "./icons";

/** Copies `text` to the clipboard and confirms for 2s. Owns its state so sibling cards are unaffected. */
export default function CopyButton({ text }: { text: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = () => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <ActionButton icon={copied ? <CheckIcon /> : <CopyIcon />} onClick={onCopy}>
      {copied ? t("act.copied") : t("act.copy")}
    </ActionButton>
  );
}
