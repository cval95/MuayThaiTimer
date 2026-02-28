import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'WorkoutComplete'>;
  route: RouteProp<RootStackParamList, 'WorkoutComplete'>;
};

export function WorkoutCompleteScreen({ navigation, route }: Props) {
  const { totalRounds, totalTime } = route.params;
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.trophy}>🏆</Text>
      <Text style={styles.title}>WORKOUT COMPLETE</Text>
      <Text style={styles.subtitle}>Great work, nak muay!</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalRounds}</Text>
          <Text style={styles.statLabel}>Rounds</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {minutes}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.statLabel}>Round Time</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.newBtnText}>BACK TO HOME</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.setupBtn}
        onPress={() => {
          navigation.popToTop();
          navigation.navigate('WorkoutSetup');
        }}
      >
        <Text style={styles.setupBtnText}>NEW WORKOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  trophy: { fontSize: 72, marginBottom: 16 },
  title: {
    color: '#EF4444',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 40,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { alignItems: 'center' },
  statValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  statLabel: { color: '#6B7280', fontSize: 13, marginTop: 4 },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#2D2D2D',
  },
  newBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
  setupBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  setupBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
