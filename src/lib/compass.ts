import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeDeg } from "./geo";

export type CompassStatus = "idle" | "active" | "denied" | "unsupported";

type IOSOrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };
type IOSOrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

const SMOOTHING = 0.2;
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Heading (degrees clockwise from north) of the direction the phone points, from W3C absolute
 * orientation angles. Flat or moderately tilted: the top edge direction (what a Qibla compass
 * needs). Upright: the direction the back camera faces. Both are projections of a device axis
 * through the ZXY rotation matrix Rz(alpha)·Rx(beta)·Ry(gamma), so there is no singular case.
 */
function headingFromAngles(alpha: number, beta: number, gamma: number): number {
  const a = rad(alpha);
  const b = rad(beta);
  const g = rad(gamma);
  const screenUp = Math.cos(b) * Math.cos(g); // vertical component of the device z axis
  let east: number;
  let north: number;
  if (Math.abs(screenUp) >= 0.5) {
    east = -Math.sin(a) * Math.cos(b);
    north = Math.cos(a) * Math.cos(b);
  } else {
    east = -(Math.cos(a) * Math.sin(g) + Math.sin(a) * Math.cos(g) * Math.sin(b));
    north = -(Math.sin(a) * Math.sin(g) - Math.cos(a) * Math.cos(g) * Math.sin(b));
  }
  return normalizeDeg((Math.atan2(east, north) * 180) / Math.PI);
}

/** Device compass heading. `start` must be called from a user gesture (iOS requires it). */
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<CompassStatus>("idle");
  const smoothed = useRef<number | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  const push = useCallback((raw: number) => {
    const prev = smoothed.current;
    // Interpolate along the shortest arc so 359° → 1° does not swing through 180°.
    const next = prev === null ? raw : normalizeDeg(prev + ((((raw - prev) % 360) + 540) % 360 - 180) * SMOOTHING);
    smoothed.current = next;
    setHeading(next);
  }, []);

  const start = useCallback(async () => {
    if (typeof DeviceOrientationEvent === "undefined") {
      setStatus("unsupported");
      return;
    }
    const ctor = DeviceOrientationEvent as IOSOrientationCtor;
    if (typeof ctor.requestPermission === "function") {
      try {
        if ((await ctor.requestPermission()) !== "granted") {
          setStatus("denied");
          return;
        }
      } catch {
        setStatus("denied");
        return;
      }
    }
    cleanup.current?.();

    const onAbsolute = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null || e.gamma === null) return;
      push(headingFromAngles(e.alpha, e.beta, e.gamma));
    };
    const onRelative = (e: Event) => {
      const ev = e as IOSOrientationEvent;
      // Safari exposes a true-north compass heading; plain `alpha` here is relative to an arbitrary start, so ignore it.
      if (typeof ev.webkitCompassHeading === "number") push(ev.webkitCompassHeading);
    };
    window.addEventListener("deviceorientationabsolute", onAbsolute as EventListener, true);
    window.addEventListener("deviceorientation", onRelative, true);
    cleanup.current = () => {
      window.removeEventListener("deviceorientationabsolute", onAbsolute as EventListener, true);
      window.removeEventListener("deviceorientation", onRelative, true);
    };
    setStatus("active");
  }, [push]);

  useEffect(() => () => cleanup.current?.(), []);

  return { heading, status, start };
}
