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

interface KickPedalProps {
  piece: DrumPiece;
  onHit: (id: DrumPiece['id']) => void;
  width: number;
  height: number;
  style?: ViewStyle;
}

export function KickPedal({ piece, onHit, width, height, style }: KickPedalProps) {
  // Native driver — transform only, on the outer view
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // JS driver — backgroundColor only, on the inner view
  const colorAnim = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    onHit(piece.id);

    // Scale: native driver, independent sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Color: JS driver, independent sequence
    Animated.sequence([
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 300,
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
            styles.kickDrum,
            { width, height, borderRadius: width / 2, backgroundColor },
          ]}
        >
          {/* Concentric rings */}
          <View
            style={[
              styles.ring,
              {
                width: width * 0.82,
                height: height * 0.82,
                borderRadius: (width * 0.82) / 2,
              },
            ]}
          />
          <View
            style={[
              styles.ring,
              {
                width: width * 0.58,
                height: height * 0.58,
                borderRadius: (width * 0.58) / 2,
              },
            ]}
          />
          <View style={styles.logoArea}>
            <Text style={[styles.label, { fontSize: width > 90 ? 13 : 10 }]}>
              {piece.label}
            </Text>
          </View>
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
  kickDrum: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 14,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
