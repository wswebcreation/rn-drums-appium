import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { DrumPieceId } from '../types/drum';
import { DRUM_PIECES } from '../constants/drumPieces';

/**
 * Number of simultaneously-playing voices per drum piece.
 * 6 handles 1/12 timing at any BPM with full natural decay overlap.
 */
const POOL_SIZE = 6;

const TOTAL_SLOTS = DRUM_PIECES.length * POOL_SIZE;

interface Slot {
  sound: Audio.Sound;
  lastPlayedAt: number;
  isFinished: boolean;
}

type Pool = Partial<Record<DrumPieceId, Slot[]>>;

async function createSlot(soundFile: ReturnType<typeof require>): Promise<Slot> {
  const { sound } = await Audio.Sound.createAsync(soundFile, {
    shouldPlay: false,
    volume: 1.0,
  });
  const slot: Slot = { sound, lastPlayedAt: 0, isFinished: true };
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      slot.isFinished = true;
    }
  });
  return slot;
}

export function useDrumKit() {
  const poolRef = useRef<Pool>({});
  // 0.0 – 1.0; 1.0 means every slot is loaded and the kit is ready
  const [progress, setProgress] = useState(0);
  const loadedRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function loadSounds() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });

        // Build the flat list of all (piece, slotIndex) pairs up front
        // then fire every createSlot in parallel. As each one resolves
        // we increment the progress counter so the loading bar advances
        // smoothly.
        const tasks = DRUM_PIECES.flatMap((piece) =>
          Array.from({ length: POOL_SIZE }, (_, i) => ({ piece, i })),
        );

        await Promise.all(
          tasks.map(async ({ piece, i }) => {
            const slot = await createSlot(piece.soundFile);

            if (!mounted) {
              slot.sound.setOnPlaybackStatusUpdate(null);
              slot.sound.unloadAsync().catch(() => {});
              return;
            }

            // Write into pool — initialise array on first slot for this piece
            if (!poolRef.current[piece.id]) {
              poolRef.current[piece.id] = [];
            }
            poolRef.current[piece.id]![i] = slot;

            // Advance progress
            loadedRef.current += 1;
            setProgress(loadedRef.current / TOTAL_SLOTS);
          }),
        );
      } catch (error) {
        console.warn('[useDrumKit] Failed to load sounds:', error);
      }
    }

    loadSounds();

    return () => {
      mounted = false;
      Object.values(poolRef.current).forEach((slots) =>
        slots?.forEach((s) => {
          s.sound.setOnPlaybackStatusUpdate(null);
          s.sound.unloadAsync().catch(() => {});
        }),
      );
      poolRef.current = {};
    };
  }, []);

  const hit = useCallback((id: DrumPieceId) => {
    const slots = poolRef.current[id];
    if (!slots?.length) return;

    // Prefer a slot that has finished its natural decay
    let slot = slots.find((s) => s.isFinished);

    // All busy — steal the oldest (furthest through decay, least audible)
    if (!slot) {
      slot = slots.reduce((oldest, s) =>
        s.lastPlayedAt < oldest.lastPlayedAt ? s : oldest,
      );
    }

    slot.isFinished = false;
    slot.lastPlayedAt = Date.now();

    slot.sound
      .setPositionAsync(0)
      .then(() => slot!.sound.playAsync())
      .catch((err) => {
        console.warn(`[useDrumKit] play ${id}:`, err);
        slot!.isFinished = true;
      });
  }, []);

  const isReady = progress >= 1;

  return { hit, progress, isReady };
}
