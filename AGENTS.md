# AGENTS.md — rn-drums-appium

Expo (managed workflow) React Native drum kit app with double bass drum.
Target: iOS + Android. Automation-ready via Appium.

---

## Project Structure

```
App.tsx                    # Root component
src/
  components/
    Cymbal.tsx             # Elliptical cymbal with hit animation
    DrumPad.tsx            # Circular/oval drum head (toms, snare)
    KickPedal.tsx          # Large bass drum circle
    DrumKit.tsx            # Full kit layout (all pieces wired together)
    index.ts               # Barrel export
  constants/
    drumPieces.ts          # DRUM_PIECES array + DRUM_PIECE_MAP
  hooks/
    useDrumKit.ts          # Loads expo-av sounds, exposes hit(id)
  types/
    drum.ts                # DrumPieceId, DrumPiece, DrumSoundMap
assets/
  sounds/                  # Bundled .mp3 drum samples
    kick.mp3, kick2.mp3, snare.mp3, hihat_closed.mp3,
    hihat_open.mp3, crash.mp3, ride.mp3,
    tom_high.mp3, tom_mid.mp3, tom_floor.mp3
```

---

## Commands

```bash
# Start dev server (Expo Go on device)
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# TypeScript type-check (no emit) — run after every change
npx tsc --noEmit

# Expo doctor — check SDK compatibility
npx expo-doctor
```

There is no test runner configured yet. When adding tests:
- Use Jest + `@testing-library/react-native`
- Run all tests: `npx jest`
- Run a single test file: `npx jest src/hooks/useDrumKit.test.ts`
- Run tests matching a name: `npx jest -t "plays kick sound"`

---

## Accessibility IDs (testID)

Every tappable drum piece has a `testID` equal to its `DrumPieceId`.
Use these for Appium selectors:

| testID          | Description           |
|-----------------|-----------------------|
| `kick`          | Bass Drum 1           |
| `kick2`         | Bass Drum 2 (double)  |
| `snare`         | Snare Drum            |
| `hihat`         | Hi-Hat Cymbal         |
| `hihat_pedal`   | Hi-Hat Pedal          |
| `crash_left`    | Left Crash Cymbal     |
| `crash_right`   | Right Crash Cymbal    |
| `ride`          | Ride Cymbal           |
| `tom_high`      | High Tom              |
| `tom_mid`       | Mid Tom               |
| `tom_floor`     | Floor Tom             |
| `drum_kit`      | Outer kit container   |
| `drum_kit_container` | ScrollView child |
| `app_root`      | SafeAreaView root     |

Appium XPath example:
```js
driver.$('~kick')         // accessibilityLabel
driver.$('//*[@resource-id="kick"]')   // Android
```

---

## Code Style

### Language & Toolchain
- TypeScript strict mode (`"strict": true` in tsconfig.json)
- Expo SDK 54 / React Native 0.81 / React 19
- No Babel config overrides; use the Expo default preset

### Imports
- Named imports preferred; avoid default imports for utilities
- Group order: React → React Native → Expo → internal (`../`) → types
- Use relative paths for imports within `src/`; no path aliases configured

```ts
// Correct import order
import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Audio } from 'expo-av';
import { DRUM_PIECES } from '../constants/drumPieces';
import { DrumPieceId } from '../types/drum';
```

### Naming Conventions
- Components: `PascalCase` (e.g. `DrumPad`, `KickPedal`)
- Hooks: `useCamelCase` (e.g. `useDrumKit`)
- Types/interfaces: `PascalCase`; prefix interfaces with nothing (no `I`)
- Constants: `UPPER_SNAKE_CASE` for module-level constants, `camelCase` for local
- Files: match the exported name (`DrumPad.tsx`, `useDrumKit.ts`)
- `testID` values: `snake_case`, matching the `DrumPieceId` type

### Component Patterns
- Functional components only; no class components
- Props interfaces defined in the same file, named `<Component>Props`
- `useCallback` for all event handlers passed as props
- `useRef` for animation values and mutable state that doesn't need re-render
- Keep `StyleSheet.create` at the bottom of each file

### Animations
- Always use `useNativeDriver: true` for `transform` and `opacity`
- Use `useNativeDriver: false` for `backgroundColor` interpolations
- **CRITICAL**: A single `Animated.View` node can only belong to one driver (native or JS).
  Never put both a `transform`/`opacity` prop (native driver) and a `backgroundColor` prop
  (JS driver) on the same `Animated.View`. Instead use two nested views:
  the outer `Animated.View` owns `transform` with `useNativeDriver: true`,
  the inner `Animated.View` owns `backgroundColor` with `useNativeDriver: false`.
  Run their animation sequences as two independent `.start()` calls — never in `Animated.parallel`.
- Animate on press: scale down on press, spring back on release

### Audio (expo-av)
- All sounds loaded once in `useDrumKit` via `Audio.Sound.createAsync`
- Retrigger: call `setPositionAsync(0)` then `playAsync()` for rapid hits
- Always set `playsInSilentModeIOS: true` in `Audio.setAudioModeAsync`
- Unload all sounds in the `useEffect` cleanup function

### Types
- Define shared types in `src/types/`; co-locate component-only types with the component
- Prefer `type` over `interface` unless declaration merging is needed
- Avoid `any`; use `unknown` and narrow explicitly
- Sound file references: type as `ReturnType<typeof require>`

### Error Handling
- Wrap `expo-av` calls in `try/catch`; use `console.warn` with a `[module]` prefix
- Never throw from event handlers; log and degrade gracefully
- Audio failures must not crash the UI

### Styling
- All styles via `StyleSheet.create`; no inline style objects with dynamic values
  except via `Animated.Value` interpolation
- Dark background theme: `#1a1a1a` base, cymbal gold `#C8A800`, drum red `#CC2200`
- Snare is gray `#D4D4D4`; hit states are lighter versions of the base color
- `shadowColor/shadowRadius` for depth; always pair with `elevation` for Android

---

## Adding a New Drum Piece

1. Add the `DrumPieceId` literal to `src/types/drum.ts`
2. Add the `DrumPiece` entry to `DRUM_PIECES` in `src/constants/drumPieces.ts`
3. Add a sound file to `assets/sounds/` and reference it via `require()`
4. Place the component (`<Cymbal>`, `<DrumPad>`, or `<KickPedal>`) in `DrumKit.tsx`
5. Set `testID={piece.id}` — this is the Appium selector

---

## Appium Automation Notes

- All interactive elements have both `testID` (→ `resource-id` on Android,
  `name` on iOS via XCUITest) and `accessibilityLabel`
- Use `testID` as the primary selector; `accessibilityLabel` as fallback
- The app is landscape-only (`"orientation": "landscape"` in app.json)
- `drum_kit` wraps the entire playable surface for bounds assertions
