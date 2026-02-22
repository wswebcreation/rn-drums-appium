import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { DRUM_PIECE_MAP } from '../constants/drumPieces';
import { DrumPieceId } from '../types/drum';
import { Cymbal } from './Cymbal';
import { DrumPad } from './DrumPad';
import { KickPedal } from './KickPedal';

interface DrumKitProps {
  onHit: (id: DrumPieceId) => void;
}

/**
 * Realistic overhead (top-down) drum kit in landscape orientation.
 *
 * Coordinate system: origin = top-left of the kit canvas.
 * All positions are expressed as fractions of canvas W×H so the
 * layout scales correctly on any landscape screen.
 *
 * Drummer's perspective (seated at bottom, facing up):
 *
 *   crash_left   hihat    tom_high  tom_mid   crash_right
 *                snare                        ride
 *   hihat_pedal           tom_floor
 *        kick (L)              kick (R)
 *
 * Cymbals sit higher (smaller, elliptical) because they are on stands
 * above the drum heads when viewed from above.
 */
export function DrumKit({ onHit }: DrumKitProps) {
  const { width: sw, height: sh } = useWindowDimensions();

  // Canvas fills the available area
  const CW = sw;
  const CH = sh;

  // ── Size helpers ─────────────────────────────────────────────
  // Cymbals are ellipses: wide but very thin (viewed from above)
  const cym = (wFrac: number) => ({
    w: CW * wFrac,
    h: CW * wFrac * 0.18, // thin ellipse = top-down cymbal
  });

  // Round drum pads (toms, snare)
  const pad = (frac: number) => ({
    w: CW * frac,
    h: CW * frac,
  });

  // Bass drums are large circles
  const kick = (frac: number) => ({
    w: CW * frac,
    h: CW * frac,
  });

  // Sizes
  const crashL  = cym(0.115);
  const crashR  = cym(0.115);
  const hihat   = cym(0.10);
  const hhPedal = cym(0.09);
  const ride    = cym(0.135);
  const snare   = pad(0.12);
  const tomHi   = pad(0.105);
  const tomMid  = pad(0.105);
  const tomFlr  = pad(0.135);
  const kick1   = kick(0.175);
  const kick2   = kick(0.175);

  /**
   * Place a piece so its centre sits at (cx, cy) fractions of CW/CH.
   * Returns absolute-position style.
   */
  function pos(cx: number, cy: number, w: number, h: number) {
    return {
      position: 'absolute' as const,
      left: CW * cx - w / 2,
      top: CH * cy - h / 2,
    };
  }

  const pieces = DRUM_PIECE_MAP;

  return (
    <View
      style={[styles.canvas, { width: CW, height: CH }]}
      testID="drum_kit"
      accessibilityLabel="Drum Kit"
    >
      {/* ── Cymbals (top row) ───────────────────────────────── */}
      {/* Crash Left — far left, high up */}
      <Cymbal
        piece={pieces['crash_left']}
        onHit={onHit}
        width={crashL.w}
        height={crashL.h}
        style={pos(0.09, 0.18, crashL.w, crashL.h)}
      />

      {/* Hi-Hat — left-centre, just above snare */}
      <Cymbal
        piece={pieces['hihat']}
        onHit={onHit}
        width={hihat.w}
        height={hihat.h}
        style={pos(0.27, 0.22, hihat.w, hihat.h)}
      />

      {/* Tom High — centre-left, top area */}
      <DrumPad
        piece={pieces['tom_high']}
        onHit={onHit}
        width={tomHi.w}
        height={tomHi.h}
        borderRadius={tomHi.w / 2}
        style={pos(0.44, 0.18, tomHi.w, tomHi.h)}
      />

      {/* Tom Mid — centre, top area */}
      <DrumPad
        piece={pieces['tom_mid']}
        onHit={onHit}
        width={tomMid.w}
        height={tomMid.h}
        borderRadius={tomMid.w / 2}
        style={pos(0.56, 0.18, tomMid.w, tomMid.h)}
      />

      {/* Crash Right — far right, high up */}
      <Cymbal
        piece={pieces['crash_right']}
        onHit={onHit}
        width={crashR.w}
        height={crashR.h}
        style={pos(0.91, 0.18, crashR.w, crashR.h)}
      />

      {/* ── Mid row ─────────────────────────────────────────── */}
      {/* Snare — left side, mid height */}
      <DrumPad
        piece={pieces['snare']}
        onHit={onHit}
        width={snare.w}
        height={snare.h}
        borderRadius={snare.w / 2}
        style={pos(0.27, 0.44, snare.w, snare.h)}
      />

      {/* Ride — right side, mid height */}
      <Cymbal
        piece={pieces['ride']}
        onHit={onHit}
        width={ride.w}
        height={ride.h}
        style={pos(0.82, 0.38, ride.w, ride.h)}
      />

      {/* Floor Tom — right-centre, lower mid */}
      <DrumPad
        piece={pieces['tom_floor']}
        onHit={onHit}
        width={tomFlr.w}
        height={tomFlr.h}
        borderRadius={tomFlr.w / 2}
        style={pos(0.70, 0.55, tomFlr.w, tomFlr.h)}
      />

      {/* ── Bass drums (bottom row) ──────────────────────────── */}
      {/* Kick 1 — left */}
      <KickPedal
        piece={pieces['kick']}
        onHit={onHit}
        width={kick1.w}
        height={kick1.h}
        style={pos(0.35, 0.72, kick1.w, kick1.h)}
      />

      {/* Kick 2 — right (double bass) */}
      <KickPedal
        piece={pieces['kick2']}
        onHit={onHit}
        width={kick2.w}
        height={kick2.h}
        style={pos(0.56, 0.72, kick2.w, kick2.h)}
      />

      {/* ── Hi-Hat Pedal — bottom-left, beside kick ─────────── */}
      <Cymbal
        piece={pieces['hihat_pedal']}
        onHit={onHit}
        width={hhPedal.w}
        height={hhPedal.h}
        style={pos(0.14, 0.82, hhPedal.w, hhPedal.h)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#111',
    overflow: 'hidden',
  },
});
