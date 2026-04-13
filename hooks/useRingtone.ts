'use client';

import { useEffect, useRef } from 'react';

// Soft two-tone ring (480 Hz / 620 Hz) generated via Web Audio API.
// Plays while `active` is true, stops immediately when it becomes false.
export function useRingtone(active: boolean): void {
  const ctxRef     = useRef<AudioContext | null>(null);
  const stopRef    = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active) {
      stopRef.current?.();
      stopRef.current = null;
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    let running = true;

    async function ring() {
      const TONES    = [480, 620] as const;
      const TONE_DUR = 0.35;   // seconds per tone
      const GAP_DUR  = 0.6;    // silence between rings
      const ATTACK   = 0.02;
      const RELEASE  = 0.05;
      const VOLUME   = 0.18;

      while (running) {
        for (const freq of TONES) {
          if (!running) break;

          const gain = ctx.createGain();
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + ATTACK);
          gain.gain.setValueAtTime(VOLUME, ctx.currentTime + TONE_DUR - RELEASE);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + TONE_DUR);

          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + TONE_DUR);

          await new Promise<void>((resolve) => {
            osc.onended = () => resolve();
          });
        }

        if (!running) break;

        // Gap between ring cycles
        await new Promise<void>((resolve) => setTimeout(resolve, GAP_DUR * 1000));
      }
    }

    ring();

    stopRef.current = () => {
      running = false;
      ctx.close();
    };

    return () => {
      running = false;
      ctx.close();
      stopRef.current = null;
    };
  }, [active]);
}
