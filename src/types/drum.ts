export type DrumPieceId =
  | 'crash_left'
  | 'crash_right'
  | 'ride'
  | 'hihat'
  | 'hihat_pedal'
  | 'snare'
  | 'tom_high'
  | 'tom_mid'
  | 'tom_floor'
  | 'kick'
  | 'kick2';

export interface DrumPiece {
  id: DrumPieceId;
  label: string;
  accessibilityLabel: string;
  soundFile: ReturnType<typeof require>;
  color: string;
  hitColor: string;
}

export type DrumSoundMap = Record<DrumPieceId, ReturnType<typeof require>>;
