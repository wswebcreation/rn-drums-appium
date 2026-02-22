import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    onHit(piece.id);

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
    outputRange: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.3)'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      accessibilityLabel={piece.accessibilityLabel}
      accessibilityRole="button"
      testID={piece.id}
      style={style}
    >
      <Animated.View
        style={[
          styles.scaleWrapper,
          { width, height },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View
          style={[
            styles.pad,
            { width, height, borderRadius, backgroundColor },
          ]}
        >
          <Text
            style={[
              styles.label,
              { fontSize: Math.min(width, height) < 60 ? 9 : 11 },
            ]}
          >
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
    // borderWidth: 1.5,
    // borderColor: 'rgba(255,255,255,0.5)',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
