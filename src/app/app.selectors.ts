import { createSelector } from '@ngrx/store'
import { selectApp } from './reducers'
import { UserKind } from './services/api/interfaces/user'

export const getActiveContract = createSelector(
  selectApp,
  (state) => state.activeContract
)

export const getSelectedTezosNode = createSelector(selectApp, (state) =>
  state.nodes?.find((node) => node.selected)
)

export const getTezosNodes = createSelector(selectApp, (state) => state.nodes)

export const getContracts = createSelector(
  selectApp,
  (state) => state.contracts
)

export const getSessionUser = createSelector(
  selectApp,
  (state) => state.sessionUser
)

export const getCanSignIn = createSelector(
  selectApp,
  (state) => state.canSignIn
)

export const getActiveAccount = createSelector(
  selectApp,
  (state) => state.activeAccount
)

export const getAddress = createSelector(
  getActiveAccount,
  (activeAccount) => activeAccount?.address
)

export const getSelectedTab = createSelector(
  selectApp,
  (state) => state.selectedTab
)

export const getUsers = createSelector(selectApp, (state) => state.users)

export const getBalance = createSelector(selectApp, (state) => state.balance)

export const getKeyholders = createSelector(getUsers, (users) =>
  users.filter((user) => user.kind === UserKind.KEYHOLDER)
)

export const getGatekeepers = createSelector(getUsers, (users) =>
  users.filter((user) => user.kind === UserKind.GATEKEEPER)
)

export const getAdmins = createSelector(getUsers, (users) =>
  users.filter((user) => user.kind === UserKind.ADMIN)
)

export const isGatekeeper = createSelector(
  getActiveContract,
  getSessionUser,
  (contract, user) =>
    contract !== undefined &&
    user !== undefined &&
    user.roles.some(
      (role) =>
        role.contract_id === contract.id && role.kind === UserKind.GATEKEEPER
    )
)

export const isKeyholder = createSelector(
  getActiveContract,
  getSessionUser,
  (contract, user) =>
    contract !== undefined &&
    user !== undefined &&
    user.roles.some(
      (role) =>
        role.contract_id === contract.id && role.kind === UserKind.KEYHOLDER
    )
)

export const isAdmin = createSelector(
  getActiveContract,
  getSessionUser,
  (contract, user) =>
    contract !== undefined &&
    user !== undefined &&
    user.roles.some(
      (role) => role.contract_id === contract.id && role.kind === UserKind.ADMIN
    )
)

export const getOpenMintOperationRequests = createSelector(
  selectApp,
  (state) => state.openMintOperationRequests
)

export const getOpenMintOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.openMintOperationRequests?.page
)

export const getApprovedMintOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedMintOperationRequests
)

export const getApprovedMintOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedMintOperationRequests?.page
)

export const getInjectedMintOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedMintOperationRequests
)

export const getInjectedMintOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedMintOperationRequests?.page
)

export const getOpenBurnOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openBurnOperationRequests
  }
)

export const getOpenBurnOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openBurnOperationRequests?.page
  }
)

export const getApprovedBurnOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedBurnOperationRequests
)

export const getApprovedBurnOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedBurnOperationRequests?.page
)

export const getInjectedBurnOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedBurnOperationRequests
)

export const getInjectedBurnOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedBurnOperationRequests?.page
)

export const getOpenAddOperatorOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openAddOperatorOperationRequests
  }
)

export const getOpenAddOperatorOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openAddOperatorOperationRequests?.page
  }
)

export const getApprovedAddOperatorOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedAddOperatorOperationRequests
)

export const getApprovedAddOperatorOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedAddOperatorOperationRequests?.page
)

export const getInjectedAddOperatorOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedAddOperatorOperationRequests
)

export const getInjectedAddOperatorOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedAddOperatorOperationRequests?.page
)

export const getOpenRemoveOperatorOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openRemoveOperatorOperationRequests
  }
)

export const getOpenRemoveOperatorOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openRemoveOperatorOperationRequests?.page
  }
)

export const getApprovedRemoveOperatorOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedRemoveOperatorOperationRequests
)

export const getApprovedRemoveOperatorOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedRemoveOperatorOperationRequests?.page
)

export const getInjectedRemoveOperatorOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedRemoveOperatorOperationRequests
)

export const getInjectedRemoveOperatorOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedRemoveOperatorOperationRequests?.page
)

///

export const getOpenSetRedeemAddressOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openSetRedeemAddressOperationRequests
  }
)

export const getOpenSetRedeemAddressOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openSetRedeemAddressOperationRequests?.page
  }
)

export const getApprovedSetRedeemAddressOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedSetRedeemAddressOperationRequests
)

export const getApprovedSetRedeemAddressOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedSetRedeemAddressOperationRequests?.page
)

export const getInjectedSetRedeemAddressOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedSetRedeemAddressOperationRequests
)

export const getInjectedSetRedeemAddressOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedSetRedeemAddressOperationRequests?.page
)

///

export const getOpenTransferOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openTransferOwnershipOperationRequests
  }
)

export const getOpenTransferOwnershipOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openTransferOwnershipOperationRequests?.page
  }
)

export const getApprovedTransferOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedTransferOwnershipOperationRequests
)

export const getApprovedTransferOwnershipOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedTransferOwnershipOperationRequests?.page
)

export const getInjectedTransferOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedTransferOwnershipOperationRequests
)

export const getInjectedTransferOwnershipOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedTransferOwnershipOperationRequests?.page
)

///

export const getOpenAcceptOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openAcceptOwnershipOperationRequests
  }
)

export const getOpenAcceptOwnershipOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openAcceptOwnershipOperationRequests?.page
  }
)

export const getApprovedAcceptOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedAcceptOwnershipOperationRequests
)

export const getApprovedAcceptOwnershipOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedAcceptOwnershipOperationRequests?.page
)

export const getInjectedAcceptOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedAcceptOwnershipOperationRequests
)

export const getInjectedAcceptOwnershipOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedAcceptOwnershipOperationRequests?.page
)

export const getOpenUpdateKeyholdersOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openUpdateKeyholdersOperationRequests
  }
)

export const getOpenUpdateKeyholdersOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openUpdateKeyholdersOperationRequests?.page
  }
)

export const getApprovedUpdateKeyholdersOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedUpdateKeyholdersOperationRequests
)

export const getApprovedUpdateKeyholdersOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedUpdateKeyholdersOperationRequests?.page
)

export const getInjectedUpdateKeyholdersOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedUpdateKeyholdersOperationRequests
)

export const getInjectedUpdateKeyholdersOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedUpdateKeyholdersOperationRequests?.page
)

export const getRedeemAddress = createSelector(
  selectApp,
  (state) => state.redeemAddress
)

export const getRedeemAddressBalance = createSelector(
  selectApp,
  (state) => state.redeemAddressBalance
)

export const getAlerts = createSelector(selectApp, (state) => state.alerts)

export const getKeyholdersToRemove = createSelector(
  selectApp,
  (state) => state.keyholdersToRemove
)

export const getKeyholdersToAdd = createSelector(
  selectApp,
  (state) => state.keyholdersToAdd
)

export const getNewThreshold = createSelector(
  selectApp,
  (state) => state.newThreshold
)

export const getBusyMintOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.mintOperationRequests
)

export const getBusyBurnOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.burnOperationRequests
)

export const getBusyAddOperatorOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.addOperatorOperationRequests
)

export const getBusyRemoveOperatorOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.removeOperatorOperationRequests
)

export const getBusySetRedeenAddressOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.setRedeemAddressOperationRequests
)

export const getBusyTransferOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.transferOwnershipOperationRequests
)

export const getBusyAcceptOwnershipOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.acceptOwnershipOperationRequests
)

export const getBusyUpdateKeyholdersOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.updateKeyholdersOperationRequests
)
