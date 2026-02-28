import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutSetupScreen } from '../screens/WorkoutSetupScreen';
import { RoundPlannerScreen } from '../screens/RoundPlannerScreen';
import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import { WorkoutCompleteScreen } from '../screens/WorkoutCompleteScreen';
import { ComboCatalogScreen } from '../screens/ComboCatalogScreen';
import { WorkoutConfig } from '../types';

export type RootStackParamList = {
  Tabs: undefined;
  WorkoutSetup: undefined;
  RoundPlanner: { config: WorkoutConfig };
  ActiveWorkout: { config: WorkoutConfig };
  WorkoutComplete: { totalRounds: number; totalTime: number };
};

export type TabParamList = {
  Home: undefined;
  ComboCatalog: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: '#0A0A0A', borderTopColor: '#1C1C1E' },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Muay Thai Timer',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="ComboCatalog"
        component={ComboCatalogScreen}
        options={{
          title: 'Combo Catalog',
          tabBarLabel: 'Catalog',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📖</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          cardStyle: { backgroundColor: '#0A0A0A', flex: 1 },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WorkoutSetup"
          component={WorkoutSetupScreen}
          options={{ title: 'New Workout' }}
        />
        <Stack.Screen
          name="RoundPlanner"
          component={RoundPlannerScreen}
          options={{ title: 'Plan Your Rounds' }}
        />
        <Stack.Screen
          name="ActiveWorkout"
          component={ActiveWorkoutScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="WorkoutComplete"
          component={WorkoutCompleteScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
