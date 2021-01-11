import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'
import {
  OperationApproval,
  Contract,
  OperationRequest,
  User,
  OperationRequestKind,
} from './services/api/api.service'
import BigNumber from 'bignumber.js'

interface Busy {
  address: boolean
  balance: boolean
  transferAmount: boolean
  receivingAddress: boolean
  mintOperationRequests: boolean
  burnOperationRequests: boolean
  contracts: boolean
  users: boolean
  operationApprovals: boolean
}

export interface State {
  contracts: Contract[]
  activeContract: Contract | undefined
  users: User[]
  operationApprovals: Map<string, OperationApproval[]>
  address: string
  balance: BigNumber | undefined
  transferAmount: number
  receivingAddress: string
  mintOperationRequests: OperationRequest[]
  burnOperationRequests: OperationRequest[]
  busy: Busy
  asset: string
}

export const initialState: State = {
  contracts: [],
  activeContract: undefined,
  users: [],
  operationApprovals: new Map<string, OperationApproval[]>(),
  address: '',
  balance: undefined,
  transferAmount: 0,
  receivingAddress: '',
  mintOperationRequests: [],
  burnOperationRequests: [],
  asset: '',
  busy: {
    address: false,
    receivingAddress: false,
    transferAmount: false,
    balance: false,
    mintOperationRequests: false,
    burnOperationRequests: false,
    contracts: false,
    users: false,
    operationApprovals: false,
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
    balance: undefined,
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
  on(actions.loadBurnOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      burnOperationRequests: true,
    },
  })),
  on(actions.loadBurnOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    burnOperationRequests: response.results,
    busy: {
      ...state.busy,
      burnOperationRequests: false,
    },
  })),
  on(actions.loadBurnOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      burnOperationRequests: false,
    },
  })),
  on(actions.loadMintOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      mintOperationRequests: true,
    },
  })),
  on(actions.loadMintOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    mintOperationRequests: response.results,
    busy: {
      ...state.busy,
      mintOperationRequests: false,
    },
  })),
  on(actions.loadMintOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      mintOperationRequests: false,
    },
  })),
  on(actions.loadOperationApprovals, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      operationApprovals: true,
    },
  })),
  on(
    actions.loadOperationApprovalsSucceeded,
    (state, { requestId, response }) => {
      const operationApprovals = new Map(state.operationApprovals)
      operationApprovals.set(requestId, response.results)
      return {
        ...state,
        operationApprovals,
        busy: {
          ...state.busy,
          operationApprovals: false,
        },
      }
    }
  ),
  on(actions.submitOperationApprovalSucceeded, (state, { response }) => {
    const operationApprovals = new Map(state.operationApprovals)
    const items = Object.assign(
      [],
      operationApprovals.get(response.operation_request_id) ?? []
    )
    items.push(response)
    operationApprovals.set(response.operation_request_id, items)
    return {
      ...state,
      operationApprovals,
      busy: {
        ...state.busy,
        operationApprovals: false,
      },
    }
  }),
  on(actions.loadOperationApprovalsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      operationApprovals: false,
    },
  })),
  on(actions.submitSignedOperationRequestSucceeded, (state, { response }) => {
    if (response.kind === OperationRequestKind.MINT) {
      const operationRequests = Object.assign([], state.mintOperationRequests)
      operationRequests.push(response)
      return {
        ...state,
        mintOperationRequests: operationRequests,
      }
    } else {
      const operationRequests = Object.assign([], state.burnOperationRequests)
      operationRequests.push(response)
      return {
        ...state,
        burnOperationRequests: operationRequests,
      }
    }
  }),
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
