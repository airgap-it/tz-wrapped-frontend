import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'
import {
  OperationApproval,
  Contract,
  OperationRequest,
  User,
  OperationRequestKind,
  SignableMessageInfo,
} from './services/api/api.service'
import BigNumber from 'bignumber.js'
import { AccountInfo } from '@airgap/beacon-sdk'
import { Tab } from './pages/dashboard/dashboard.component'

interface Busy {
  activeAccount: boolean
  balance: boolean
  mintOperationRequests: boolean
  burnOperationRequests: boolean
  contracts: boolean
  users: boolean
  operationApprovals: boolean
  signableMessages: boolean
  contractNonces: boolean
}

export interface State {
  selectedTab: Tab
  activeAccount: AccountInfo | undefined
  contracts: Contract[]
  activeContract: Contract | undefined
  contractNonces: Map<string, number>
  users: User[]
  operationApprovals: Map<string, OperationApproval[]>
  signableMessages: Map<string, SignableMessageInfo>
  balance: BigNumber | undefined
  mintOperationRequests: OperationRequest[]
  burnOperationRequests: OperationRequest[]
  busy: Busy
}

export const initialState: State = {
  selectedTab: Tab.TRANSFER,
  activeAccount: undefined,
  contracts: [],
  activeContract: undefined,
  contractNonces: new Map<string, number>(),
  users: [],
  operationApprovals: new Map<string, OperationApproval[]>(),
  signableMessages: new Map<string, SignableMessageInfo>(),
  balance: undefined,
  mintOperationRequests: [],
  burnOperationRequests: [],
  busy: {
    activeAccount: false,
    balance: false,
    mintOperationRequests: false,
    burnOperationRequests: false,
    contracts: false,
    users: false,
    operationApprovals: false,
    signableMessages: false,
    contractNonces: false,
  },
}

export const reducer = createReducer(
  initialState,
  on(actions.selectTab, (state, { tab }) => ({
    ...state,
    selectedTab: tab,
    busy: {
      ...state.busy,
    },
  })),
  on(actions.connectWallet, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      address: true,
    },
  })),
  on(actions.connectWalletSucceeded, (state, { accountInfo }) => ({
    ...state,
    activeAccount: accountInfo,
    busy: {
      ...state.busy,
      address: true,
    },
  })),
  on(actions.disconnectWallet, (state) => ({
    ...state,
    activeAccount: undefined,
    balance: undefined,
    busy: {
      ...state.busy,
      address: false,
    },
  })),
  on(actions.loadBalance, (state) => ({
    ...state,
    balance: undefined,
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
  on(actions.loadContractNonce, (state, { contractId }) => ({
    ...state,
    busy: {
      ...state.busy,
      contractNonces: true,
    },
  })),
  on(actions.loadContractNonceSucceeded, (state, { contractId, nonce }) => {
    const contractNonces = new Map(state.contractNonces)
    contractNonces.set(contractId, nonce)
    return {
      ...state,
      contractNonces,
      busy: {
        ...state.busy,
        contractNonces: false,
      },
    }
  }),
  on(actions.loadOperationApprovals, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      operationApprovals: true,
    },
  })),
  on(
    actions.loadOperationApprovalsSucceeded,
    (state, { operationRequestId: requestId, response }) => {
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
  on(actions.loadOperationApprovalsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      operationApprovals: false,
    },
  })),
  on(actions.getSignableMessage, (state, { operationRequestId }) => ({
    ...state,
    busy: {
      ...state.busy,
      signableMessages: true,
    },
  })),
  on(
    actions.getSignableMessageSucceeded,
    (state, { signableMessage, operationRequestId }) => {
      const signableMessages = new Map(state.signableMessages)
      signableMessages.set(operationRequestId, signableMessage)
      return {
        ...state,
        signableMessages,
        busy: {
          ...state.busy,
          signableMessages: false,
        },
      }
    }
  ),
  on(actions.getSignableMessageFailed, (state, { error }) => ({
    ...state,
    busy: {
      ...state.busy,
      signableMessages: false,
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
  on(
    actions.submitOperationApprovalSucceeded,
    (state, { operationApproval, operationRequest }) => {
      const operationApprovals = new Map(state.operationApprovals)
      const items = Object.assign(
        [],
        operationApprovals.get(operationApproval.operation_request_id) ?? []
      )
      items.push(operationApproval)
      operationApprovals.set(operationApproval.operation_request_id, items)
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
  on(actions.setActiveContract, (state, { contract }) => ({
    ...state,
    activeContract: contract,
    busy: {
      ...state.busy,
    },
  }))
)
