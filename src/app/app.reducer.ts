import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'
import { Approval, Contract, Operation, User } from './services/api/api.service'

interface Busy {
  address: boolean
  transferAmount: boolean
  receivingAddress: boolean
  mintingRequests: boolean
  contracts: boolean
  users: boolean
  approvals: boolean
}

interface App {
  contracts: Contract[]
  users: User[]
  approvals: Approval[]
  address: string
  transferAmount: number
  receivingAddress: string
  mintingOperations: Operation[]
}

export interface State {
  app: App
  busy: Busy
}

export const initialState: State = {
  app: {
    contracts: [],
    users: [],
    approvals: [], // TODO: We might have to filter those per request
    address: '',
    transferAmount: 0,
    receivingAddress: '',
    mintingOperations: [],
  },
  busy: {
    address: false,
    receivingAddress: false,
    transferAmount: false,
    mintingRequests: false,
    contracts: false,
    users: false,
    approvals: false,
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
  on(actions.disconnectWallet, (state) => ({
    ...state,
    address: undefined, // TODO: Why is it on this level? It doesn't work if we remove it, but I it shouldn't be here
    app: {
      ...state.app,
      address: '',
    },
    busy: {
      ...state.busy,
      address: false,
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
    address, // TODO: Why is it on this level? It doesn't work if we remove it, but I it shouldn't be here
    app: {
      ...state.app,
      address,
    },
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
  on(actions.loadContracts, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      contracts: true,
    },
  })),
  on(actions.loadContractsSucceeded, (state, { response }) => ({
    ...state,
    app: {
      ...state.app,
      contracts: response.results,
    },
    busy: {
      ...state.busy,
      contracts: false,
    },
  })),
  on(actions.loadContractsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      contracts: false,
    },
  })),
  on(actions.loadUsers, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      users: true,
    },
  })),
  on(actions.loadUsersSucceeded, (state, { response }) => ({
    ...state,
    app: {
      ...state.app,
      users: response.results,
    },
    busy: {
      ...state.busy,
      users: false,
    },
  })),
  on(actions.loadUsersFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      users: false,
    },
  })),
  on(
    actions.transferOperation,
    (state, { transferAmount, receivingAddress }) => ({
      ...state,
      app: {
        ...state.app,
        transferAmount,
        receivingAddress,
      },
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
  })),
  on(actions.loadMintingRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      mintingRequests: true,
    },
  })),
  on(actions.loadMintingRequestsSucceeded, (state, { response }) => ({
    ...state,
    app: {
      ...state.app,
      mintingOperations: response.results,
    },
    busy: {
      ...state.busy,
      mintingRequests: false,
    },
  })),
  on(actions.loadMintingRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      mintingRequests: false,
    },
  })),
  on(actions.loadApprovals, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      approvals: true,
    },
  })),
  on(actions.loadApprovalsSucceeded, (state, { requestId, response }) => ({
    ...state,
    app: {
      ...state.app,
      approvals: response.results.map((result) => ({
        ...result,
        request_id: requestId,
      })),
    },
    busy: {
      ...state.busy,
      approvals: false,
    },
  })),
  on(actions.loadApprovalsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      approvals: false,
    },
  }))
)
