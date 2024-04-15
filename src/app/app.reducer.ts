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
import {
  OperationRequest,
  OperationRequestKind,
} from './services/api/interfaces/operationRequest'
import { SessionUser } from './services/api/interfaces/auth'
import { Tab } from './pages/dashboard/tab'
import { ErrorDescription } from './components/error-item/error-description'
import { TezosNode } from './services/api/interfaces/nodes'

interface Busy {
  activeAccount: boolean
  balance: boolean
  mintOperationRequests: boolean
  burnOperationRequests: boolean
  addOperatorOperationRequests: boolean
  removeOperatorOperationRequests: boolean
  setRedeemAddressOperationRequests: boolean
  transferOwnershipOperationRequests: boolean
  acceptOwnershipOperationRequests: boolean
  updateKeyholdersOperationRequests: boolean
  contracts: boolean
  users: boolean
  signableMessages: boolean
  contractNonces: boolean
}

export interface State {
  selectedTab: Tab
  sessionUser: SessionUser | undefined
  canSignIn: boolean | undefined
  activeAccount: AccountInfo | undefined
  nodes: TezosNode[] | undefined
  contracts: Contract[]
  activeContract: Contract | undefined
  contractNonces: Map<string, number>
  users: User[]
  signableMessages: Map<string, SignableMessageInfo>
  balance: BigNumber | undefined

  openMintOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedMintOperationRequests: PagedResponse<OperationRequest> | undefined
  injectedMintOperationRequests: PagedResponse<OperationRequest> | undefined

  openBurnOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedBurnOperationRequests: PagedResponse<OperationRequest> | undefined
  injectedBurnOperationRequests: PagedResponse<OperationRequest> | undefined

  openAddOperatorOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedAddOperatorOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedAddOperatorOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  openRemoveOperatorOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  approvedRemoveOperatorOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedRemoveOperatorOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  openSetRedeemAddressOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  approvedSetRedeemAddressOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedSetRedeemAddressOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  openTransferOwnershipOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  approvedTransferOwnershipOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedTransferOwnershipOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  openAcceptOwnershipOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  approvedAcceptOwnershipOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedAcceptOwnershipOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  openUpdateKeyholdersOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  approvedUpdateKeyholdersOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedUpdateKeyholdersOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  redeemAddress: string | undefined
  redeemAddressBalance: BigNumber | undefined
  alerts: ErrorDescription[] | null

  keyholdersToRemove: User[]
  keyholdersToAdd: string[]
  newThreshold: number | undefined

  busy: Busy
}

export const initialState: State = {
  selectedTab: Tab.TRANSFER,
  sessionUser: undefined,
  canSignIn: undefined,
  activeAccount: undefined,
  nodes: undefined,
  contracts: [],
  activeContract: undefined,
  contractNonces: new Map<string, number>(),
  users: [],
  signableMessages: new Map<string, SignableMessageInfo>(),
  balance: undefined,

  openMintOperationRequests: undefined,
  approvedMintOperationRequests: undefined,
  injectedMintOperationRequests: undefined,

  openBurnOperationRequests: undefined,
  approvedBurnOperationRequests: undefined,
  injectedBurnOperationRequests: undefined,

  openAddOperatorOperationRequests: undefined,
  approvedAddOperatorOperationRequests: undefined,
  injectedAddOperatorOperationRequests: undefined,

  openRemoveOperatorOperationRequests: undefined,
  approvedRemoveOperatorOperationRequests: undefined,
  injectedRemoveOperatorOperationRequests: undefined,

  openSetRedeemAddressOperationRequests: undefined,
  approvedSetRedeemAddressOperationRequests: undefined,
  injectedSetRedeemAddressOperationRequests: undefined,

  openTransferOwnershipOperationRequests: undefined,
  approvedTransferOwnershipOperationRequests: undefined,
  injectedTransferOwnershipOperationRequests: undefined,

  openAcceptOwnershipOperationRequests: undefined,
  approvedAcceptOwnershipOperationRequests: undefined,
  injectedAcceptOwnershipOperationRequests: undefined,

  openUpdateKeyholdersOperationRequests: undefined,
  approvedUpdateKeyholdersOperationRequests: undefined,
  injectedUpdateKeyholdersOperationRequests: undefined,

  redeemAddress: undefined,
  redeemAddressBalance: undefined,
  alerts: null,

  keyholdersToRemove: [],
  keyholdersToAdd: [],
  newThreshold: undefined,

  busy: {
    activeAccount: false,
    balance: false,
    mintOperationRequests: false,
    burnOperationRequests: false,
    addOperatorOperationRequests: false,
    removeOperatorOperationRequests: false,
    setRedeemAddressOperationRequests: false,
    transferOwnershipOperationRequests: false,
    acceptOwnershipOperationRequests: false,
    updateKeyholdersOperationRequests: false,
    contracts: false,
    users: false,
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
    openUpdateKeyholdersOperationRequests: undefined,
    approvedUpdateKeyholdersOperationRequests: undefined,
    injectedUpdateKeyholdersOperationRequests: undefined,
  })),
  on(actions.updateCanSignIn, (state, { canSignIn }) => ({
    ...state,
    canSignIn,
  })),
  on(actions.getSessionUserSucceeded, (state, { sessionUser }) => ({
    ...state,
    sessionUser,
  })),
  on(actions.updateSessionUserSucceeded, (state, { sessionUser }) => ({
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
  on(actions.loadTezosNodesSucceeded, (state, { response }) => ({
    ...state,
    nodes: response,
  })),
  on(actions.loadTezosNodesFailed, (state) => ({
    ...state,
    nodes: undefined,
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
    contracts: [],
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
    users: [],
    busy: {
      ...state.busy,
      users: false,
    },
  })),
  /// BURN
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
  /// MINT
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
  /// ADD OPERATOR
  on(actions.loadAddOperatorOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      addOperatorOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenAddOperatorOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openAddOperatorOperationRequests: response,

      busy: {
        ...state.busy,
        addOperatorOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedAddOperatorOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedAddOperatorOperationRequests: response,
      busy: {
        ...state.busy,
        addOperatorOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedAddOperatorOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedAddOperatorOperationRequests: response,
      busy: {
        ...state.busy,
        addOperatorOperationRequests: false,
      },
    })
  ),

  on(actions.loadAddOperatorOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      addOperatorOperationRequests: false,
    },
  })),
  /// REMOVE OPERATOR
  on(actions.loadRemoveOperatorOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      removeOperatorOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenRemoveOperatorOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openRemoveOperatorOperationRequests: response,

      busy: {
        ...state.busy,
        removeOperatorOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedRemoveOperatorOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedRemoveOperatorOperationRequests: response,
      busy: {
        ...state.busy,
        removeOperatorOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedRemoveOperatorOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedRemoveOperatorOperationRequests: response,
      busy: {
        ...state.busy,
        removeOperatorOperationRequests: false,
      },
    })
  ),

  on(actions.loadRemoveOperatorOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      removeOperatorOperationRequests: false,
    },
  })),
  /// SET REDEEM ADDRESS
  on(actions.loadSetRedeemAddressOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      setRedeemAddressOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenSetRedeemAddressOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openSetRedeemAddressOperationRequests: response,

      busy: {
        ...state.busy,
        setRedeemAddressOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedSetRedeemAddressOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedSetRedeemAddressOperationRequests: response,
      busy: {
        ...state.busy,
        setRedeemAddressOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedSetRedeemAddressOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedSetRedeemAddressOperationRequests: response,
      busy: {
        ...state.busy,
        setRedeemAddressOperationRequests: false,
      },
    })
  ),
  on(actions.loadSetRedeemAddressOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      setRedeemAddressOperationRequests: false,
    },
  })),
  /// TRANSFER OWNERSHIP
  on(actions.loadTransferOwnershipOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      transferOwnershipOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenTransferOwnershipOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openTransferOwnershipOperationRequests: response,

      busy: {
        ...state.busy,
        transferOwnershipOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedTransferOwnershipOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedTransferOwnershipOperationRequests: response,
      busy: {
        ...state.busy,
        transferOwnershipOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedTransferOwnershipOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedTransferOwnershipOperationRequests: response,
      busy: {
        ...state.busy,
        transferOwnershipOperationRequests: false,
      },
    })
  ),
  on(actions.loadTransferOwnershipOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      transferOwnershipOperationRequests: false,
    },
  })),
  /// ACCEPT OWNERSHIP
  on(actions.loadAcceptOwnershipOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      acceptOwnershipOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenAcceptOwnershipOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openAcceptOwnershipOperationRequests: response,

      busy: {
        ...state.busy,
        acceptOwnershipOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedAcceptOwnershipOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedAcceptOwnershipOperationRequests: response,
      busy: {
        ...state.busy,
        acceptOwnershipOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedAcceptOwnershipOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedAcceptOwnershipOperationRequests: response,
      busy: {
        ...state.busy,
        acceptOwnershipOperationRequests: false,
      },
    })
  ),
  on(actions.loadAcceptOwnershipOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      acceptOwnershipOperationRequests: false,
    },
  })),

  on(actions.loadUpdateKeyholdersOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      updateKeyholdersOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenUpdateKeyholdersOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openUpdateKeyholdersOperationRequests: response,
      busy: {
        ...state.busy,
        updateKeyholdersOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedUpdateKeyholdersOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedUpdateKeyholdersOperationRequests: response,
      busy: {
        ...state.busy,
        updateKeyholdersOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedUpdateKeyholdersOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedUpdateKeyholdersOperationRequests: response,
      busy: {
        ...state.busy,
        updateKeyholdersOperationRequests: false,
      },
    })
  ),
  on(actions.loadUpdateKeyholdersOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      updateKeyholdersOperationRequests: false,
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
    users: [],
    activeContract: contract,
    openMintOperationRequests: undefined,
    approvedMintOperationRequests: undefined,
    injectedMintOperationRequests: undefined,
    openBurnOperationRequests: undefined,
    approvedBurnOperationRequests: undefined,
    injectedBurnOperationRequests: undefined,
    openUpdateKeyholdersOperationRequests: undefined,
    approvedUpdateKeyholdersOperationRequests: undefined,
    injectedUpdateKeyholdersOperationRequests: undefined,
    keyholdersToRemove: [],
    keyholdersToAdd: [],
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
  on(actions.updateKeyholdersToRemove, (state, { keyholder }) => {
    const removeIndex = state.keyholdersToRemove.indexOf(keyholder)
    const keyholdersToRemove = [...state.keyholdersToRemove]
    if (removeIndex !== -1) {
      keyholdersToRemove.splice(removeIndex, 1)
    } else {
      keyholdersToRemove.push(keyholder)
    }
    return {
      ...state,
      keyholdersToRemove,
    }
  }),
  on(actions.resetKeyholdersToRemove, (state) => ({
    ...state,
    keyholdersToRemove: [],
  })),
  on(actions.updateKeyholdersToAdd, (state, { keyholder }) => {
    const removeIndex = state.keyholdersToAdd.indexOf(keyholder)
    const keyholdersToAdd = [...state.keyholdersToAdd]
    if (removeIndex !== -1) {
      keyholdersToAdd.splice(removeIndex, 1)
    } else {
      keyholdersToAdd.push(keyholder)
    }
    return {
      ...state,
      keyholdersToAdd,
    }
  }),
  on(actions.resetKeyholdersToAdd, (state) => ({
    ...state,
    keyholdersToAdd: [],
  })),
  on(actions.updateThreshold, (state, { threshold }) => ({
    ...state,
    newThreshold: threshold,
  })),
  on(actions.resetThreshold, (state) => ({
    ...state,
    newThreshold: undefined,
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
  })),
  on(actions.submitOperationRequest, (state, { newOperationRequest }) => ({
    ...state,
    busy: {
      ...state.busy,
      mintOperationRequests:
        newOperationRequest.kind === OperationRequestKind.MINT ||
        state.busy.mintOperationRequests,
      burnOperationRequests:
        newOperationRequest.kind === OperationRequestKind.BURN ||
        state.busy.burnOperationRequests,
      addOperatorOperationRequests:
        newOperationRequest.kind === OperationRequestKind.ADD_OPERATOR ||
        state.busy.addOperatorOperationRequests,
      removeOperatorOperationRequests:
        newOperationRequest.kind === OperationRequestKind.REMOVE_OPERATOR ||
        state.busy.removeOperatorOperationRequests,
      setRedeemAddressOperationRequests:
        newOperationRequest.kind === OperationRequestKind.SET_REDEEM_ADDRESS ||
        state.busy.setRedeemAddressOperationRequests,
      transferOwnershipOperationRequests:
        newOperationRequest.kind === OperationRequestKind.TRANSFER_OWNERSHIP ||
        state.busy.transferOwnershipOperationRequests,
      acceptOwnershipOperationRequests:
        newOperationRequest.kind === OperationRequestKind.ACCEPT_OWNERSHIP ||
        state.busy.acceptOwnershipOperationRequests,
      updateKeyholdersOperationRequests:
        newOperationRequest.kind === OperationRequestKind.UPDATE_KEYHOLDERS ||
        state.busy.updateKeyholdersOperationRequests,
    },
  })),
  on(
    actions.submitOperationRequestFailed,
    (state, { newOperationRequest }) => ({
      ...state,
      busy: {
        ...state.busy,
        mintOperationRequests:
          newOperationRequest.kind !== OperationRequestKind.MINT &&
          state.busy.mintOperationRequests,
        burnOperationRequests:
          newOperationRequest.kind !== OperationRequestKind.BURN &&
          state.busy.burnOperationRequests,
        addOperatorOperationRequests:
          newOperationRequest.kind !== OperationRequestKind.ADD_OPERATOR &&
          state.busy.addOperatorOperationRequests,
        removeOperatorOperationRequests:
          newOperationRequest.kind !== OperationRequestKind.REMOVE_OPERATOR &&
          state.busy.removeOperatorOperationRequests,
        setRedeemAddressOperationRequests:
          newOperationRequest.kind !==
            OperationRequestKind.SET_REDEEM_ADDRESS &&
          state.busy.setRedeemAddressOperationRequests,
        transferOwnershipOperationRequests:
          newOperationRequest.kind ===
            OperationRequestKind.TRANSFER_OWNERSHIP ||
          state.busy.transferOwnershipOperationRequests,
        acceptOwnershipOperationRequests:
          newOperationRequest.kind === OperationRequestKind.ACCEPT_OWNERSHIP ||
          state.busy.acceptOwnershipOperationRequests,
        updateKeyholdersOperationRequests:
          newOperationRequest.kind !== OperationRequestKind.UPDATE_KEYHOLDERS &&
          state.busy.updateKeyholdersOperationRequests,
      },
    })
  )
)
