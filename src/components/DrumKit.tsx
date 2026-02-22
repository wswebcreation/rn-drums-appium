import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { DRUM_PIECE_MAP } from '../constants/drumPieces';
import { DrumPieceId } from '../types/drum';
import { Cymbal } from './Cymbal';
import { DrumPad } from './DrumPad';
import { KickPedal } from './KickPedal';

const BG_IMAGE = require('../../assets/drumkit-bg.png');
const IMAGE_ASPECT = 1024 / 682;

// ── Per-piece layout config (single source of truth) ────────────────
// size   = base size as fraction of imgW (controls height)
// aspect = width / height (1 = circle, >1 = wider)
// cx, cy = centre position as fractions of the displayed image
const LAYOUT = {
  crash_left:  { size: 0.16,  aspect: 1.65, cx: 0.145,  cy: 0.16  },
  hihat:       { size: 0.11,  aspect: 1.5, cx: 0.08, cy: 0.37  },
  ride:        { size: 0.175,  aspect: 1.5, cx: 0.67,  cy: 0.16  },
  crash_right: { size: 0.185,  aspect: 1.3, cx: 0.89,  cy: 0.26  },
  tom_high:    { size: 0.095, aspect: 1.3, cx: 0.26,  cy: 0.34  },
  tom_mid:     { size: 0.095, aspect: 1.3, cx: 0.4,   cy: 0.275 },
  tom_low:     { size: 0.095, aspect: 1.3, cx: 0.56,  cy: 0.29  },
  snare:       { size: 0.10,  aspect: 1.7, cx: 0.42,  cy: 0.50  },
  tom_floor:   { size: 0.135,  aspect: 1.5, cx: 0.74,  cy: 0.48  },
  kick:        { size: 0.17,  aspect: 1,   cx: 0.30,  cy: 0.65  },
  kick2:       { size: 0.17,  aspect: 1,   cx: 0.56,  cy: 0.65  },
  hihat_pedal: { size: 0.085,   aspect: 1.5, cx: 0.345,  cy: 0.145  },
} as const;

interface DrumKitProps {
  onHit: (id: DrumPieceId) => void;
}

export function DrumKit({ onHit }: DrumKitProps) {
  const { width: sw, height: sh } = useWindowDimensions();

  const CW = sw;
  const CH = sh;

  // "Contain" the image: compute the displayed rect so positions stay
  // aligned with the photo regardless of screen aspect ratio.
  const screenAspect = CW / CH;
  let imgW: number, imgH: number, imgX: number, imgY: number;
  if (screenAspect > IMAGE_ASPECT) {
    imgH = CH;
    imgW = CH * IMAGE_ASPECT;
    imgX = (CW - imgW) / 2;
    imgY = 0;
  } else {
    imgW = CW;
    imgH = CW / IMAGE_ASPECT;
    imgX = 0;
    imgY = (CH - imgH) / 2;
  }

  // Resolve a layout config entry into pixel values + absolute style
  function resolve(key: keyof typeof LAYOUT) {
    const { size, aspect, cx, cy } = LAYOUT[key];
    const h = imgW * size;
    const w = h * aspect;
    return {
      w,
      h,
      borderRadius: w / 2,
      style: {
        position: 'absolute' as const,
        left: imgX + imgW * cx - w / 2,
        top: imgY + imgH * cy - h / 2,
      },
    };
  }

  const p = DRUM_PIECE_MAP;

  const crashL  = resolve('crash_left');
  const hihat   = resolve('hihat');
  const ride    = resolve('ride');
  const crashR  = resolve('crash_right');
  const tomHi   = resolve('tom_high');
  const tomMid  = resolve('tom_mid');
  const tomLow  = resolve('tom_low');
  const snare   = resolve('snare');
  const tomFlr  = resolve('tom_floor');
  const kick1   = resolve('kick');
  const kick2   = resolve('kick2');
  const hhPedal = resolve('hihat_pedal');

  return (
    <View
      style={[styles.canvas, { width: CW, height: CH }]}
      testID="drum_kit"
      accessibilityLabel="Drum Kit"
    >
      <Image
        source={BG_IMAGE}
        style={[styles.bg, { left: imgX, top: imgY, width: imgW, height: imgH }]}
        resizeMode="cover"
      />

      {/* ── Cymbals ─────────────────────────────────────────────── */}
      <Cymbal piece={p['crash_left']}  onHit={onHit} width={crashL.w}  height={crashL.h}  style={crashL.style} />
      <Cymbal piece={p['hihat']}       onHit={onHit} width={hihat.w}   height={hihat.h}   style={hihat.style} />
      <Cymbal piece={p['ride']}        onHit={onHit} width={ride.w}    height={ride.h}    style={ride.style} />
      <Cymbal piece={p['crash_right']} onHit={onHit} width={crashR.w}  height={crashR.h}  style={crashR.style} />

      {/* ── Toms ────────────────────────────────────────────────── */}
      <DrumPad piece={p['tom_high']}  onHit={onHit} width={tomHi.w}  height={tomHi.h}  borderRadius={tomHi.borderRadius}  style={tomHi.style} />
      <DrumPad piece={p['tom_mid']}   onHit={onHit} width={tomMid.w} height={tomMid.h} borderRadius={tomMid.borderRadius} style={tomMid.style} />
      <DrumPad piece={p['tom_low']}   onHit={onHit} width={tomLow.w} height={tomLow.h} borderRadius={tomLow.borderRadius} style={tomLow.style} />

      {/* ── Snare ───────────────────────────────────────────────── */}
      <DrumPad piece={p['snare']} onHit={onHit} width={snare.w} height={snare.h} borderRadius={snare.borderRadius} style={snare.style} />

      {/* ── Floor Tom ───────────────────────────────────────────── */}
      <DrumPad piece={p['tom_floor']} onHit={onHit} width={tomFlr.w} height={tomFlr.h} borderRadius={tomFlr.borderRadius} style={tomFlr.style} />

      {/* ── Bass Drums ──────────────────────────────────────────── */}
      <KickPedal piece={p['kick']}  onHit={onHit} width={kick1.w} height={kick1.h} style={kick1.style} />
      <KickPedal piece={p['kick2']} onHit={onHit} width={kick2.w} height={kick2.h} style={kick2.style} />

      {/* ── Hi-Hat Pedal ────────────────────────────────────────── */}
      <Cymbal piece={p['hihat_pedal']} onHit={onHit} width={hhPedal.w} height={hhPedal.h} style={hhPedal.style} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
  },
});
