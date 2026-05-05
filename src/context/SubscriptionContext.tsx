import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { useAuth } from './AuthContext';

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS!;
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID!;
const BUNDLE_ID = process.env.EXPO_PUBLIC_BUNDLE_ID!;
const ENTITLEMENT = 'MTApp Pro';

interface SubscriptionContextValue {
  isSubscribed: boolean;
  isLoading: boolean;
  expiresDate: Date | null;
  isTrial: boolean;
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
  const [expiresDate, setExpiresDate] = useState<Date | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const configured = useRef(false);
  const rcAvailable = useRef(false);

  function applyCustomerInfo(info: CustomerInfo) {
    const entitlement = info.entitlements.active[ENTITLEMENT];
    setIsSubscribed(entitlement !== undefined);
    setExpiresDate(entitlement?.expirationDate ? new Date(entitlement.expirationDate) : null);
    setIsTrial(entitlement?.periodType === 'TRIAL');
  }

  // Configure RevenueCat once on mount
  useEffect(() => {
    if (configured.current) return;
    configured.current = true;

    try {
      const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
      if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey });
      rcAvailable.current = true;
    } catch {
      // RC not available in Expo Go — fail open
      setIsSubscribed(__DEV__);
      setIsLoading(false);
    }
  }, []);

  // When auth state changes, identify/logout RevenueCat user and refresh entitlement
  useEffect(() => {
    const syncUser = async () => {
      if (!rcAvailable.current) return;
      setIsLoading(true);
      try {
        if (user) {
          const { customerInfo } = await Purchases.logIn(user.id);
          applyCustomerInfo(customerInfo);
        } else {
          await Purchases.logOut();
          setIsSubscribed(false);
          setExpiresDate(null);
          setIsTrial(false);
        }
      } catch (e) {
        setIsSubscribed(false);
        setExpiresDate(null);
        setIsTrial(false);
      } finally {
        setIsLoading(false);
      }
    };
    syncUser();
  }, [user]);

  // Listen for real-time subscription updates (e.g. after purchase sheet closes)
  useEffect(() => {
    const onCustomerInfoUpdate = (info: CustomerInfo) => {
      applyCustomerInfo(info);
    };
    Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate);
    return () => { Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdate); };
  }, []);

  const subscribe = async (): Promise<{ error: string | null }> => {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.product.identifier === `${BUNDLE_ID}.annual`
      );
      if (!pkg) return { error: 'No subscription package available' };
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      applyCustomerInfo(customerInfo);
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
      applyCustomerInfo(customerInfo);
      if (!restored) return { error: 'No active subscription found to restore.' };
      return { error: null };
    } catch (e: any) {
      return { error: e.message ?? 'Restore failed' };
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, isLoading, expiresDate, isTrial, subscribe, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
