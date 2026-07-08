import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./launch-motion.js";

const DISCOVERY_STOPS = [12, 48, 137, 284, 516] as const;
const DISCOVERY_DELAYS_MS = [100, 140, 180, 240, 320, 460] as const;

export function useAnimatedCounter(target: number, active: boolean): number {
  const [value, setValue] = useState(active && prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const stops = [...DISCOVERY_STOPS, target];
    const timers: number[] = [];
    let elapsed = 0;

    stops.forEach((stop, index) => {
      elapsed += DISCOVERY_DELAYS_MS[index] ?? 460;
      timers.push(
        window.setTimeout(() => {
          setValue(stop);
        }, elapsed)
      );
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [active, target]);

  return value;
}
