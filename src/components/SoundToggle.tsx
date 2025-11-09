import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { useClient } from '@context/ClientContext';

function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensureCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current!;
  };
  return {
    play: (freq = 880, durationMs = 120) => {
      const ctx = ensureCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
      o.start();
      o.stop(t + durationMs / 1000 + 0.05);
    },
    resume: async () => {
      const ctx = ensureCtx();
      if (ctx.state === 'suspended') await ctx.resume();
    },
  };
}

export const SoundToggle: React.FC = () => {
  const { state, dispatch } = useClient();
  const { play, resume } = useBeep();

  const label = useMemo(() => (state.soundsEnabled ? '🔊' : '🔇'), [state.soundsEnabled]);

  return (
    <>
      <Button
        size="sm"
        variant={state.soundsEnabled ? 'primary' : 'outline-secondary'}
        onClick={async () => {
          await resume();
          dispatch({ type: 'sounds:set', payload: !state.soundsEnabled });
          play(880, 80);
        }}
      >
        {label}
      </Button>
      <SoundManager />
    </>
  );
};

const SoundManager: React.FC = () => {
  const { state } = useClient();
  const { play } = useBeep();
  const prevActiveRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const active = state.gameState?.activePlayerId;
    if (!state.soundsEnabled || !active) {
      prevActiveRef.current = active;
      return;
    }
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    // Start of turn sound for current player
    if (active && state.playerId && active === state.playerId && prev !== active) {
      play(660, 120);
      setTimeout(() => play(880, 120), 130);
    }
  }, [state.soundsEnabled, state.gameState?.activePlayerId, state.playerId, play]);

  // Optional: timer warning under 10s
  useEffect(() => {
    const end = state.gameState?.turnEndsAt;
    if (!state.soundsEnabled || !end || state.gameState?.activePlayerId !== state.playerId) return;
    const id = setInterval(() => {
      const remaining = end - Date.now();
      if (remaining <= 10_000 && remaining > 9_500) {
        play(400, 100);
      }
    }, 500);
    return () => clearInterval(id);
  }, [state.soundsEnabled, state.gameState?.turnEndsAt, state.gameState?.activePlayerId, state.playerId, play]);

  return null;
};

