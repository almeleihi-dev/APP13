import { LAUNCH_KEY_CLICK_ENABLED } from "./launch-motion.js";

let audioContext: AudioContext | null = null;

/** Soft mechanical keyboard click — disabled by default via LAUNCH_KEY_CLICK_ENABLED. */
export function playKeyClick(): void {
  if (!LAUNCH_KEY_CLICK_ENABLED || typeof window === "undefined") return;

  try {
    const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    audioContext ??= new Ctx();
    const ctx = audioContext;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "square";
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.8;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    /* optional audio — fail silently */
  }
}
