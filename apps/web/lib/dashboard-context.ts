'use client';

import { createContext, useContext } from 'react';

import { DEMO_ACCOUNT_ID } from '@/lib/constants';

export interface DashboardContextValue {
  readonly accountId: string;
  readonly accountPlan: string;
  readonly isDemo: boolean;
  readonly setAccountPlan: (plan: string) => void;
}

export const DashboardContext = createContext<DashboardContextValue>({
  accountId: '',
  accountPlan: 'trial',
  isDemo: false,
  setAccountPlan: () => undefined,
});

export function useDashboard(): DashboardContextValue {
  return useContext(DashboardContext);
}

export function getIsDemo(accountId: string): boolean {
  return accountId === DEMO_ACCOUNT_ID;
}
