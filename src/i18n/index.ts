import { commonDict } from "./dictionaries/common";
import { onboardingDict } from "./dictionaries/onboarding";
import { homeDict } from "./dictionaries/home";
import { searchDict } from "./dictionaries/search";
import { mosqueDict } from "./dictionaries/mosque";
import { scannerDict } from "./dictionaries/scanner";
import { orderDict } from "./dictionaries/order";
import { profileDict } from "./dictionaries/profile";
import { communityDict } from "./dictionaries/community";
import { smartDict } from "./dictionaries/smart";
import { travelDict } from "./dictionaries/travel";
import { engagementDict } from "./dictionaries/engagement";
import { rewardsDict } from "./dictionaries/rewards";
import { accessibilityDict } from "./dictionaries/accessibility";

export type Lang = "ko" | "en" | "uz";

export const LANGUAGES: { code: Lang; flag: string; name: string; sub: string }[] = [
  { code: "ko", flag: "🇰🇷", name: "한국어", sub: "Korean" },
  { code: "en", flag: "🇺🇸", name: "English", sub: "English" },
  { code: "uz", flag: "🇺🇿", name: "O'zbek", sub: "Uzbek" },
];

type Dict = Record<string, Partial<Record<Lang, Record<string, string>>>>;

export const dictionaries: Dict = {
  common: commonDict,
  onboarding: onboardingDict,
  home: homeDict,
  search: searchDict,
  mosque: mosqueDict,
  scanner: scannerDict,
  order: orderDict,
  profile: profileDict,
  community: communityDict,
  smart: smartDict,
  travel: travelDict,
  engagement: engagementDict,
  rewards: rewardsDict,
  accessibility: accessibilityDict,
};

/**
 * Looks up "namespace.key" in the given language, falling back to Korean
 * (the app's source language) and finally to the raw key so missing
 * translations never render as blank UI.
 */
export function translate(lang: Lang, key: string): string {
  const dotIndex = key.indexOf(".");
  if (dotIndex === -1) return key;
  const ns = key.slice(0, dotIndex);
  const k = key.slice(dotIndex + 1);
  const nsDict = dictionaries[ns];
  if (!nsDict) return key;
  return nsDict[lang]?.[k] ?? nsDict.ko?.[k] ?? key;
}
