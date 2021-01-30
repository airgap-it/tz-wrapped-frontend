import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'
import BigNumber from 'bignumber.js'
import { AccountInfo } from '@airgap/beacon-sdk'
import { Contract } from './services/api/interfaces/contract'
import { User } from './services/api/interfaces/user'
import { OperationApproval } from './services/api/interfaces/operationApproval'
import {
  PagedResponse,
  SignableMessageInfo,
} from './services/api/interfaces/common'
import { OperationRequest } from './services/api/interfaces/operationRequest'
import { SessionUser } from './services/api/interfaces/auth'
import { Tab } from './pages/dashboard/tab'
import { ErrorDescription } from './components/error-item/error-description'

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
  sessionUser: SessionUser | undefined
  canSignIn: boolean | undefined
  activeAccount: AccountInfo | undefined
  contracts: Contract[]
  activeContract: Contract | undefined
  contractNonces: Map<string, number>
  users: User[]
  operationApprovals: Map<string, OperationApproval[]>
  signableMessages: Map<string, SignableMessageInfo>
  balance: BigNumber | undefined

  openMintOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedMintOperationRequests: PagedResponse<OperationRequest> | undefined
  injectedMintOperationRequests: PagedResponse<OperationRequest> | undefined

  openBurnOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedBurnOperationRequests: PagedResponse<OperationRequest> | undefined
  injectedBurnOperationRequests: PagedResponse<OperationRequest> | undefined

  redeemAddress: string | undefined
  redeemAddressBalance: BigNumber | undefined
  alerts: ErrorDescription[] | null
  busy: Busy
}

export const initialState: State = {
  selectedTab: Tab.TRANSFER,
  sessionUser: undefined,
  canSignIn: undefined,
  activeAccount: undefined,
  contracts: [],
  activeContract: undefined,
  contractNonces: new Map<string, number>(),
  users: [],
  operationApprovals: new Map<string, OperationApproval[]>(),
  signableMessages: new Map<string, SignableMessageInfo>(),
  balance: undefined,

  openMintOperationRequests: undefined,
  approvedMintOperationRequests: undefined,
  injectedMintOperationRequests: undefined,

  openBurnOperationRequests: undefined,
  approvedBurnOperationRequests: undefined,
  injectedBurnOperationRequests: undefined,

  redeemAddress: undefined,
  redeemAddressBalance: undefined,
  alerts: null,
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
  on(actions.handleUnauthenticatedError, (state) => ({
    ...state,
    sessionUser: undefined,
    users: [],
    operationApprovals: new Map<string, OperationApproval[]>(),
    signableMessages: new Map<string, SignableMessageInfo>(),
    openMintOperationRequests: undefined,
    approvedMintOperationRequests: undefined,
    injectedMintOperationRequests: undefined,
    openBurnOperationRequests: undefined,
    approvedBurnOperationRequests: undefined,
    injectedBurnOperationRequests: undefined,
  })),
  on(actions.updateCanSignIn, (state, { canSignIn }) => ({
    ...state,
    canSignIn,
  })),
  on(actions.getSessionUserSucceeded, (state, { sessionUser }) => ({
    ...state,
    sessionUser,
  })),
  on(actions.signOutSucceeded, (state) => ({
    ...state,
    canSignIn: undefined,
    sessionUser: undefined,
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
  on(actions.loadOpenBurnOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    openBurnOperationRequests: response,

    busy: {
      ...state.busy,
      burnOperationRequests: false,
    },
  })),
  on(
    actions.loadApprovedBurnOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedBurnOperationRequests: response,
      busy: {
        ...state.busy,
        burnOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedBurnOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedBurnOperationRequests: response,
      busy: {
        ...state.busy,
        burnOperationRequests: false,
      },
    })
  ),
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
  on(actions.loadOpenMintOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    openMintOperationRequests: response,

    busy: {
      ...state.busy,
      mintOperationRequests: false,
    },
  })),
  on(
    actions.loadApprovedMintOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedMintOperationRequests: response,
      busy: {
        ...state.busy,
        mintOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedMintOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedMintOperationRequests: response,
      busy: {
        ...state.busy,
        mintOperationRequests: false,
      },
    })
  ),

  on(actions.loadMintOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      mintOperationRequests: false,
    },
  })),
  on(actions.loadContractNonce, (state) => ({
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
  on(actions.getSignableMessage, (state) => ({
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
  on(actions.getSignableMessageFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      signableMessages: false,
    },
  })),
  on(actions.setActiveContract, (state, { contract }) => ({
    ...state,
    activeContract: contract,
    openMintOperationRequests: undefined,
    approvedMintOperationRequests: undefined,
    injectedMintOperationRequests: undefined,
    openBurnOperationRequests: undefined,
    approvedBurnOperationRequests: undefined,
    injectedBurnOperationRequests: undefined,
    busy: {
      ...state.busy,
    },
  })),
  on(actions.showAlert, (state, { alertMessage }) => ({
    ...state,
    alerts: state.alerts ? [...state.alerts, alertMessage] : [alertMessage],
    busy: {
      ...state.busy,
    },
  })),
  on(actions.clearAlerts, (state) => ({
    ...state,
    alerts: null,
    busy: {
      ...state.busy,
    },
  })),
  on(actions.loadRedeemAddress, (state) => ({
    ...state,
    redeemAddress: undefined,
    redeemAddressBalance: undefined,
  })),
  on(actions.loadRedeemAddressSucceeded, (state, { address }) => ({
    ...state,
    redeemAddress: address,
  })),
  on(actions.loadRedeemAddressBalanceSucceeded, (state, { balance }) => ({
    ...state,
    redeemAddressBalance: balance,
  }))
)
