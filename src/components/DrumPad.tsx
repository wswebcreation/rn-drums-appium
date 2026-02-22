import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { DrumPiece } from '../types/drum';

interface DrumPadProps {
  piece: DrumPiece;
  onHit: (id: DrumPiece['id']) => void;
  width: number;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function DrumPad({
  piece,
  onHit,
  width,
  height,
  borderRadius = 12,
  style,
}: DrumPadProps) {
  // Native driver — transform only, on the outer view
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // JS driver — backgroundColor only, on the inner view
  const colorAnim = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    onHit(piece.id);

    // Scale: native driver, independent sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.91,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Color: JS driver, independent sequence
    Animated.sequence([
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [onHit, piece.id, scaleAnim, colorAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [piece.color, piece.hitColor],
  });

  const numLugs = 6;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      accessibilityLabel={piece.accessibilityLabel}
      accessibilityRole="button"
      testID={piece.id}
      style={style}
    >
      {/* Outer view: native-driver transform ONLY */}
      <Animated.View
        style={[
          styles.scaleWrapper,
          { width, height },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Inner view: JS-driver backgroundColor ONLY */}
        <Animated.View
          style={[
            styles.pad,
            { width, height, borderRadius, backgroundColor },
          ]}
        >
          {/* Lug bolts around the rim */}
          {Array.from({ length: numLugs }).map((_, i) => {
            const angle = (i / numLugs) * 2 * Math.PI - Math.PI / 2;
            const rx = width / 2 - 7;
            const ry = height / 2 - 7;
            return (
              <View
                key={i}
                style={[
                  styles.lug,
                  {
                    position: 'absolute',
                    left: width / 2 + rx * Math.cos(angle) - 3,
                    top: height / 2 + ry * Math.sin(angle) - 3,
                  },
                ]}
              />
            );
          })}

          {/* Inner head ring */}
          <View
            style={[
              styles.innerRing,
              {
                width: width * 0.72,
                height: height * 0.72,
                borderRadius: borderRadius * 0.72,
              },
            ]}
          />

          <Text style={[styles.label, { fontSize: Math.min(width, height) < 60 ? 9 : 11 }]}>
            {piece.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scaleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 7,
    elevation: 10,
    overflow: 'hidden',
  },
  lug: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(220,220,220,0.55)',
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
