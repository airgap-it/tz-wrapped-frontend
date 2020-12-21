import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'

interface Busy {
  address: boolean
  transferAmount: boolean
  receivingAddress: boolean
}

interface App {
  address: string
  transferAmount: number
  receivingAddress: string
}

export interface State {
  app: App
  busy: Busy
}

export const initialState: State = {
  app: {} as any,
  busy: {
    address: false,
    receivingAddress: false,
    transferAmount: false,
  },
}

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
  })),
  on(
    actions.transferOperation,
    (state, { transferAmount, receivingAddress }) => ({
      ...state,
      transferAmount,
      receivingAddress,
      busy: {
        ...state.busy,
        receivingAddress: true,
        transferAmount: true,
      },
    })
  ),
  on(actions.transferOperationSucceeded, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      receivingAddress: false,
      transferAmount: false,
    },
  })),
  on(actions.transferOperationFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      receivingAddress: false,
      transferAmount: false,
    },
  }))
)
