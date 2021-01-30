import { createSelector } from '@ngrx/store'
import { selectApp } from './reducers'
import { UserKind } from './services/api/interfaces/user'

export const getActiveContract = createSelector(
  selectApp,
  (state) => state.activeContract
)

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

export const getRedeemAddress = createSelector(
  selectApp,
  (state) => state.redeemAddress
)

export const getRedeemAddressBalance = createSelector(
  selectApp,
  (state) => state.redeemAddressBalance
)

export const getAlerts = createSelector(selectApp, (state) => state.alerts)
