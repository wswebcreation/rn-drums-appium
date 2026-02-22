import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { DRUM_PIECE_MAP } from '../constants/drumPieces';
import { DrumPieceId } from '../types/drum';
import { Cymbal } from './Cymbal';
import { DrumPad } from './DrumPad';
import { KickPedal } from './KickPedal';

const BG_IMAGE = require('../../assets/drumkit-bg.png');
const IMAGE_ASPECT = 1024 / 682;

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

  // ── Size helpers — all relative to image width ──────────────────
  const cym = (frac: number) => {
    const size = imgW * frac;
    return { w: size, h: size };
  };
  const pad = (frac: number) => ({ w: imgW * frac, h: imgW * frac });
  const kickSz = (frac: number) => ({ w: imgW * frac, h: imgW * frac });
  const crashL  = cym(0.17);
  const crashR  = cym(0.19);
  const hihat   = cym(0.12);
  const hhPedal = cym(0.1);
  const ride    = cym(0.18);
  const snare   = pad(0.10);
  const tomHi   = pad(0.095);
  const tomMid  = pad(0.095);
  const tomLow  = pad(0.095);
  const tomFlr  = pad(0.14);
  const kick1   = kickSz(0.17);
  const kick2   = kickSz(0.17);

  /**
   * Centre a piece at (cx, cy) — fractions of the displayed image —
   * and convert to absolute positioning within the full screen canvas.
   */
  function pos(cx: number, cy: number, w: number, h: number) {
    return {
      position: 'absolute' as const,
      left: imgX + imgW * cx - w / 2,
      top: imgY + imgH * cy - h / 2,
    };
  }

  const p = DRUM_PIECE_MAP;

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
      <Cymbal piece={p['crash_left']}  onHit={onHit} width={crashL.w}  height={crashL.h}  style={pos(0.15,  0.15, crashL.w,  crashL.h)} />
      <Cymbal piece={p['hihat']}       onHit={onHit} width={hihat.w}   height={hihat.h}   style={pos(0.075, 0.35,  hihat.w,   hihat.h)} />
      <Cymbal piece={p['ride']}        onHit={onHit} width={ride.w}    height={ride.h}    style={pos(0.67, 0.15, ride.w,    ride.h)} />
      <Cymbal piece={p['crash_right']} onHit={onHit} width={crashR.w}  height={crashR.h}  style={pos(0.89,  0.25,  crashR.w,  crashR.h)} />

      {/* ── Toms ────────────────────────────────────────────────── */}
      <DrumPad piece={p['tom_high']}  onHit={onHit} width={tomHi.w}  height={tomHi.h}  borderRadius={tomHi.w / 2}  style={pos(0.26,  0.34,  tomHi.w,  tomHi.h)} />
      <DrumPad piece={p['tom_mid']}   onHit={onHit} width={tomMid.w} height={tomMid.h} borderRadius={tomMid.w / 2} style={pos(0.4, 0.275, tomMid.w, tomMid.h)} />
      <DrumPad piece={p['tom_low']}   onHit={onHit} width={tomLow.w} height={tomLow.h} borderRadius={tomLow.w / 2} style={pos(0.56, 0.29, tomLow.w, tomLow.h)} />

      {/* ── Snare ───────────────────────────────────────────────── */}
      <DrumPad piece={p['snare']} onHit={onHit} width={snare.w} height={snare.h} borderRadius={snare.w / 2} style={pos(0.42, 0.50, snare.w, snare.h)} />

      {/* ── Floor Tom ───────────────────────────────────────────── */}
      <DrumPad piece={p['tom_floor']} onHit={onHit} width={tomFlr.w} height={tomFlr.h} borderRadius={tomFlr.w / 2} style={pos(0.74, 0.46, tomFlr.w, tomFlr.h)} />

      {/* ── Bass Drums ──────────────────────────────────────────── */}
      <KickPedal piece={p['kick']}  onHit={onHit} width={kick1.w} height={kick1.h} style={pos(0.30, 0.65, kick1.w, kick1.h)} />
      <KickPedal piece={p['kick2']} onHit={onHit} width={kick2.w} height={kick2.h} style={pos(0.56, 0.65, kick2.w, kick2.h)} />

      {/* ── Hi-Hat Pedal ────────────────────────────────────────── */}
      <Cymbal piece={p['hihat_pedal']} onHit={onHit} width={hhPedal.w} height={hhPedal.h} style={pos(0.34, 0.15, hhPedal.w, hhPedal.h)} />
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
