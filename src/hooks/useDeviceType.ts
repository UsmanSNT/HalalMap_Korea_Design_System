import { useEffect, useState } from "react";

export type DeviceType = "desktop" | "android" | "ios";

const STORAGE_KEY = "halalmap-device-override";

function detectDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  return "desktop";
}

export function getDeviceOverride(): DeviceType | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "desktop" || stored === "android" || stored === "ios" ? stored : null;
}

export function setDeviceOverride(value: DeviceType | null) {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(STORAGE_KEY, value);
  else window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("halalmap-device-override-change"));
}

/**
 * Resolves which design variant to render: real device UA, unless a dev override
 * is set (used by the on-screen device switcher for testing without swapping devices).
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => getDeviceOverride() ?? detectDeviceType());

  useEffect(() => {
    const sync = () => setDeviceType(getDeviceOverride() ?? detectDeviceType());
    window.addEventListener("halalmap-device-override-change", sync);
    return () => window.removeEventListener("halalmap-device-override-change", sync);
  }, []);

  return deviceType;
}
