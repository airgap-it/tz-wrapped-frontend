import { createReducer, on } from "@ngrx/store";

import * as actions from "./app.actions";

interface Busy {
  address: boolean;
}

interface app {
  address: string;
}

export interface State {
  app: app;
  busy: Busy;
}

export const initialState: State = {
  app: undefined,
  busy: {
    address: false,
  },
};

export const reducer = createReducer(
  initialState,
  on(actions.connectWallet, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      address: true,
    },
  })),
  on(actions.loadAddress, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      address: true,
    },
  })),
  on(actions.loadAddressSucceeded, (state, { address }) => ({
    ...state,
    address,
    busy: {
      ...state.busy,
      address: false,
    },
  })),
  on(actions.loadAddressFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      address: false,
    },
  }))
);
