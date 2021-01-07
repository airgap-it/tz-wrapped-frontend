import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'
import { Approval, Contract, Operation, User } from './services/api/api.service'
import BigNumber from 'bignumber.js'

interface Busy {
  address: boolean
  balance: boolean
  transferAmount: boolean
  receivingAddress: boolean
  mintingRequests: boolean
  burningRequests: boolean
  contracts: boolean
  users: boolean
  approvals: boolean
}

export interface State {
  contracts: Contract[]
  activeContract: Contract | undefined
  users: User[]
  approvals: Approval[]
  address: string
  balance: BigNumber | undefined
  transferAmount: number
  receivingAddress: string
  mintingOperations: Operation[]
  burningOperations: Operation[]
  pendingMintingOperations: Operation[]
  busy: Busy
  asset: string
}

export const initialState: State = {
  contracts: [],
  activeContract: undefined,
  users: [],
  approvals: [], // TODO: We might have to filter those per request
  address: '',
  balance: undefined,
  transferAmount: 0,
  receivingAddress: '',
  mintingOperations: [],
  burningOperations: [],
  pendingMintingOperations: [],
  asset: '',
  busy: {
    address: false,
    receivingAddress: false,
    transferAmount: false,
    balance: false,
    mintingRequests: false,
    burningRequests: false,
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
    address: '',
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

  on(actions.loadBalance, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      balance: true,
    },
  })),
  on(actions.loadBalanceSucceeded, (state, { balance }) => ({
    ...state,
    balance,
    busy: {
      ...state.busy,
      balance: false,
    },
  })),
  on(actions.loadBalanceFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      balance: false,
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
    contracts: response.results,
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
    users: response.results,
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
  })),
  on(actions.loadBurningRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      burningRequests: true,
    },
  })),
  on(actions.loadBurningRequestsSucceeded, (state, { response }) => ({
    ...state,
    burningOperations: response.results,
    busy: {
      ...state.busy,
      burningRequests: false,
    },
  })),
  on(actions.loadBurningRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      burningRequests: false,
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
    mintingOperations: response.results,
    pendingMintingOperations: response.results.filter(
      (request) => request.state != 'approved'
    ),
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
    approvals: response.results.map((result) => ({
      ...result,
      request_id: requestId,
    })),
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
  })),
  on(actions.changeAsset, (state, { asset }) => ({
    ...state,
    asset: asset,
    busy: {
      ...state.busy,
    },
  })),
  on(actions.setActiveContract, (state, { contract }) => ({
    ...state,
    activeContract: contract,
    busy: {
      ...state.busy,
    },
  }))
)
