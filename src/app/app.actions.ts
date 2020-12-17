import { createAction, props } from "@ngrx/store";
import { NavigationEnd } from "@angular/router";

const featureName = "App";

export const saveLatestRoute = createAction(
  `[${featureName}] Save Latest Route`,
  props<{ navigation: NavigationEnd }>()
);
export const connectWallet = createAction(
  `[${featureName}] Connect Wallet with Beacon`
);
export const connectWalletSucceeded = createAction(
  `[${featureName}] Connect Wallet with Beacon Succeeded`
);
export const connectWalletFailed = createAction(
  `[${featureName}] Connect Wallet with Beacon Failed`,
  props<{ error: any }>()
);

export const loadAddress = createAction(
  `[${featureName}] Load Address of Connected Wallet`
);
export const loadAddressSucceeded = createAction(
  `[${featureName}] Load Address of Connected Wallet Succeeded`,
  props<{ address: string }>()
);
export const loadAddressFailed = createAction(
  `[${featureName}] Load Address of Connected Wallet Failed`,
  props<{ error: any }>()
);

export const transferOperation = createAction(
  `[${featureName}] Starting Transfer Operation`,
  props<{ transferAmount: number; receivingAddress: string }>()
);
export const transferOperationSucceeded = createAction(
  `[${featureName}] Transferring Succeeded`
);
export const transferOperationFailed = createAction(
  `[${featureName}] Transferring Failed`,
  props<{ error: any }>()
);
