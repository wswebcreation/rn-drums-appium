import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { DrumPiece } from '../types/drum';

interface CymbalProps {
  piece: DrumPiece;
  onHit: (id: DrumPiece['id']) => void;
  width: number;
  height: number;
  style?: ViewStyle;
}

export function Cymbal({ piece, onHit, width, height, style }: CymbalProps) {
  // Native driver — transform only, on the outer view
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // JS driver — backgroundColor only, on the inner view
  const colorAnim = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    onHit(piece.id);

    // Scale: native driver, independent sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.93,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Color: JS driver, independent sequence
    Animated.sequence([
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 40,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [onHit, piece.id, scaleAnim, colorAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [piece.color, piece.hitColor],
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
            styles.cymbal,
            { width, height, borderRadius: width / 2, backgroundColor },
          ]}
        >
          {/* Centre dome — plain View, no animated style */}
          <Animated.View
            style={[
              styles.cymbalDome,
              {
                width: width * 0.28,
                height: width * 0.28,
                borderRadius: (width * 0.28) / 2,
                backgroundColor,
              },
            ]}
          />
          <Text style={[styles.label, { fontSize: width < 70 ? 8 : 10 }]}>
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
  cymbal: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
    elevation: 7,
  },
  cymbalDome: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  label: {
    color: '#1a1a1a',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
