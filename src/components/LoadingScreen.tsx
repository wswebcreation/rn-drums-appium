import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  progress: number; // 0.0 – 1.0
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 120,
      useNativeDriver: false, // width is a layout prop — must be JS driver
    }).start();
  }, [progress, animatedWidth]);

  const percent = Math.round(progress * 100);

  return (
    <View style={styles.root} testID="loading_screen">
      <Text style={styles.title}>DRUM KIT</Text>
      <Text style={styles.subtitle}>DOUBLE BASS</Text>

      <View style={styles.barTrack} testID="loading_bar_track">
        <Animated.View
          testID="loading_bar_fill"
          style={[
            styles.barFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.percentLabel} testID="loading_percent">
        {percent === 100 ? 'Ready…' : `Loading sounds… ${percent}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#e8e8e8',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
  },
  subtitle: {
    color: '#555',
    fontSize: 12,
    letterSpacing: 6,
    marginTop: -10,
  },
  barTrack: {
    width: '60%',
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#C8A800',
    borderRadius: 3,
  },
  percentLabel: {
    color: '#555',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
