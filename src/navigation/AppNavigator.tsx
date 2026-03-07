import React from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { WorkoutConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

export type RootStackParamList = {
  // Auth flow
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  // Paywall flow
  Paywall: undefined;
  ComboCatalogPreview: undefined;
  // Main app
  Tabs: undefined;
  WorkoutSetup: undefined;
  RoundPlanner: { config: WorkoutConfig };
  ActiveWorkout: { config: WorkoutConfig };
  WorkoutComplete: { totalRounds: number; totalTime: number };
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  ComboCatalog: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#EF4444" size="large" />
    </View>
  );
}

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

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#0A0A0A' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' as const },
  cardStyle: { backgroundColor: '#0A0A0A', flex: 1 },
};

export function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, isLoading: subLoading } = useSubscription();

  // Show spinner while auth session and subscription status are resolving
  if (authLoading || subLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {!user ? (
          // ── Auth flow ──────────────────────────────────────────────────
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : !isSubscribed ? (
          // ── Paywall flow ───────────────────────────────────────────────
          <>
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ComboCatalogPreview"
              component={ComboCatalogScreen}
              options={{ title: 'Combo Catalog' }}
            />
          </>
        ) : (
          // ── Main app ───────────────────────────────────────────────────
          <>
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
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
