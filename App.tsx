import React, { useCallback } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { DrumKit, LoadingScreen } from './src/components';
import { useDrumKit } from './src/hooks/useDrumKit';
import { DrumPieceId } from './src/types/drum';

export default function App() {
  const { hit, progress, isReady } = useDrumKit();

  const handleHit = useCallback(
    (id: DrumPieceId) => {
      hit(id);
    },
    [hit],
  );

  return (
    <SafeAreaView style={styles.root} testID="app_root">
      <StatusBar hidden />
      {isReady ? (
        <DrumKit onHit={handleHit} />
      ) : (
        <LoadingScreen progress={progress} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111',
  },
});
