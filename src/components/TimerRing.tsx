import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  remaining: number;
  total: number;
  color?: string;
  size?: number;
}

/**
 * Circular timer using two clipped half-ring views (no SVG dependency).
 */
export function TimerRing({ remaining, total, color = '#EF4444', size = 220 }: Props) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const progress = total > 0 ? remaining / total : 0;
  const strokeWidth = 10;
  const fillDeg = progress * 360;

  // Two halves fill the ring from 0→180 (right) and 180→360 (left)
  const rightDeg = fillDeg > 180 ? 180 : fillDeg;
  const leftDeg = fillDeg > 180 ? fillDeg - 180 : 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#2D2D2D',
        }}
      />

      {/* Right half (0–180°) */}
      <View style={[styles.halfClip, { width: size / 2, height: size, left: size / 2 }]}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: rightDeg > 0 ? color : 'transparent',
            position: 'absolute',
            right: 0,
            transform: [{ rotate: `${rightDeg - 180}deg` }],
          }}
        />
      </View>

      {/* Left half (180–360°) */}
      <View style={[styles.halfClip, { width: size / 2, height: size, right: size / 2 }]}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: leftDeg > 0 ? color : 'transparent',
            position: 'absolute',
            left: 0,
            transform: [{ rotate: `${leftDeg - 180}deg` }],
          }}
        />
      </View>

      {/* Inner mask to create the ring cutout */}
      <View
        style={{
          position: 'absolute',
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          backgroundColor: '#0A0A0A',
        }}
      />

      <Text style={styles.time}>{timeStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  halfClip: {
    position: 'absolute',
    overflow: 'hidden',
  },
  time: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
    position: 'absolute',
  },
});
