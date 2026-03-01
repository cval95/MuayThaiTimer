import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { useAuth } from './AuthContext';

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS!;
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID!;
const ENTITLEMENT = 'premium';

interface SubscriptionContextValue {
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<{ error: string | null }>;
  restorePurchases: () => Promise<{ error: string | null }>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function hasEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT] !== undefined;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const configured = useRef(false);

  // Configure RevenueCat once on mount
  useEffect(() => {
    if (configured.current) return;
    configured.current = true;

    const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
  }, []);

  // When auth state changes, identify/logout RevenueCat user and refresh entitlement
  useEffect(() => {
    const syncUser = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const { customerInfo } = await Purchases.logIn(user.id);
          setIsSubscribed(hasEntitlement(customerInfo));
        } else {
          await Purchases.logOut();
          setIsSubscribed(false);
        }
      } catch (e) {
        // If RC isn't reachable (e.g. no API key set yet in dev), fail open in dev, closed in prod
        setIsSubscribed(__DEV__);
      } finally {
        setIsLoading(false);
      }
    };
    syncUser();
  }, [user]);

  // Listen for real-time subscription updates (e.g. after purchase sheet closes)
  useEffect(() => {
    const onCustomerInfoUpdate = (info: CustomerInfo) => {
      setIsSubscribed(hasEntitlement(info));
    };
    Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate);
    return () => { Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdate); };
  }, []);

  const subscribe = async (): Promise<{ error: string | null }> => {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.annual ?? offerings.current?.availablePackages[0];
      if (!pkg) return { error: 'No subscription package available' };
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsSubscribed(hasEntitlement(customerInfo));
      return { error: null };
    } catch (e: any) {
      if (e.userCancelled) return { error: null }; // user dismissed sheet
      return { error: e.message ?? 'Purchase failed' };
    }
  };

  const restorePurchases = async (): Promise<{ error: string | null }> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const restored = hasEntitlement(customerInfo);
      setIsSubscribed(restored);
      if (!restored) return { error: 'No active subscription found to restore.' };
      return { error: null };
    } catch (e: any) {
      return { error: e.message ?? 'Restore failed' };
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, isLoading, subscribe, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
