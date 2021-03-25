import { createAction, props } from '@ngrx/store'
import {
  AccountInfo,
  OperationResponseOutput,
  RequestOperationInput,
} from '@airgap/beacon-sdk'
import BigNumber from 'bignumber.js'
import {
  PagedResponse,
  SignableMessageInfo,
} from './services/api/interfaces/common'
import { Contract } from './services/api/interfaces/contract'
import { User } from './services/api/interfaces/user'
import {
  NewOperationRequest,
  OperationRequest,
  OperationRequestKind,
  OperationRequestState,
} from './services/api/interfaces/operationRequest'
import { OperationApproval } from './services/api/interfaces/operationApproval'
import { HttpErrorResponse } from '@angular/common/http'
import {
  AuthenticationChallenge,
  AuthenticationChallengeResponse,
  SessionUser,
} from './services/api/interfaces/auth'
import { Tab } from './pages/dashboard/tab'
import { ErrorDescription } from './components/error-item/error-description'

const featureName = 'App'

export const selectTab = createAction(
  `[${featureName}] Select Tab`,
  props<{ tab: Tab }>()
)

export const getSignInChallenge = createAction(
  `[${featureName}] Get Sign-In Challenge`,
  props<{ address: string }>()
)
export const getSignInChallengeSucceeded = createAction(
  `[${featureName}] Get Sign-In Challenge Succeeded`,
  props<{ challenge: AuthenticationChallenge | null }>()
)
export const getSignInChallengeFailed = createAction(
  `[${featureName}] Get Sign-In Challenge Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const signChallenge = createAction(
  `[${featureName}] Sign Challenge`,
  props<{ challenge: AuthenticationChallenge }>()
)
export const signChallengeSucceeded = createAction(
  `[${featureName}] Sign Challenge Succeeded`,
  props<{ challengeResponse: AuthenticationChallengeResponse }>()
)
export const signChallengeFailed = createAction(
  `[${featureName}] Sign Challenge Failed`,
  props<{ error: any }>()
)

export const respondToSignInChallenge = createAction(
  `[${featureName}] Respond to Sign Challenge`,
  props<{ challengeResponse: AuthenticationChallengeResponse }>()
)
export const respondToSignInChallengeSucceeded = createAction(
  `[${featureName}] Respond to Sign Challenge Succeeded`,
  props<{ sessionUser: SessionUser }>()
)
export const respondToSignInChallengeFailed = createAction(
  `[${featureName}] Respond to Sign Challenge Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const getSessionUser = createAction(`[${featureName}] Get Session User`)
export const getSessionUserSucceeded = createAction(
  `[${featureName}] Get Session User Succeeded`,
  props<{ sessionUser: SessionUser }>()
)
export const getSessionUserFailed = createAction(
  `[${featureName}] Get Session User Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const updateSessionUser = createAction(
  `[${featureName}] Update Session User`,
  props<{ displayName: string; email: string | null }>()
)
export const updateSessionUserSucceeded = createAction(
  `[${featureName}] Update Session User Succeeded`,
  props<{ sessionUser: SessionUser }>()
)
export const updateSessionUserFailed = createAction(
  `[${featureName}] Update Session User Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const updateCanSignIn = createAction(
  `[${featureName}] Update Can Sign In`,
  props<{ canSignIn: boolean }>()
)

export const handleHttpErrorResponse = createAction(
  `[${featureName}] Handle HttpErrorResponse`,
  props<{ errorResponse: HttpErrorResponse }>()
)
export const handleUnauthenticatedError = createAction(
  `[${featureName}] Handle Unauthenticated Error`
)

export const signOut = createAction(`[${featureName}] Sign Out`)
export const signOutSucceeded = createAction(
  `[${featureName}] Sign Out Succeeded`
)
export const signOutFailed = createAction(
  `[${featureName}] Sign Out Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const setupBeacon = createAction(`[${featureName}] Setup Beacon`)
export const setupBeaconSucceeded = createAction(
  `[${featureName}] Setup Beacon Succeeded`
)
export const setupBeaconFailed = createAction(
  `[${featureName}] Setup Beacon Failed`,
  props<{ error: any }>()
)

export const connectWallet = createAction(
  `[${featureName}] Connect Wallet with Beacon`
)
export const connectWalletSucceeded = createAction(
  `[${featureName}] Connect Wallet with Beacon Succeeded`,
  props<{ accountInfo: AccountInfo | undefined }>()
)
export const connectWalletFailed = createAction(
  `[${featureName}] Connect Wallet with Beacon Failed`,
  props<{ error: any }>()
)

export const disconnectWallet = createAction(
  `[${featureName}] Disconnect Wallet`
)
export const disconnectWalletSucceeded = createAction(
  `[${featureName}] Disconnect Wallet Succeeded`
)
export const disconnectWalletFailed = createAction(
  `[${featureName}] Disconnect Wallet Failed`,
  props<{ error: any }>()
)

export const loadAddress = createAction(
  `[${featureName}] Load Address of Connected Wallet`
)
export const loadAddressSucceeded = createAction(
  `[${featureName}] Load Address of Connected Wallet Succeeded`,
  props<{ address: string }>()
)
export const loadAddressFailed = createAction(
  `[${featureName}] Load Address of Connected Wallet Failed`,
  props<{ error: any }>()
)

export const loadContractNonce = createAction(
  `[${featureName}] Load Contract Nonce`,
  props<{ contractId: string }>()
)
export const loadContractNonceSucceeded = createAction(
  `[${featureName}] Load Contract Nonce Succeeded`,
  props<{ contractId: string; nonce: number }>()
)
export const loadContractNonceFailed = createAction(
  `[${featureName}] Load Contract Nonce Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadBalance = createAction(
  `[${featureName}] Load Balance of Connected Wallet`
)
export const loadBalanceSucceeded = createAction(
  `[${featureName}] Load Balance of Connected Wallet Succeeded`,
  props<{ balance: BigNumber | undefined }>()
)
export const loadBalanceFailed = createAction(
  `[${featureName}] Load Balance of Connected Wallet Failed`,
  props<{ error: any }>()
)

export const loadContracts = createAction(`[${featureName}] Load Contracts `)
export const loadContractsSucceeded = createAction(
  `[${featureName}] Load Contracts Succeeded`,
  props<{ response: PagedResponse<Contract> }>()
)
export const loadContractsFailed = createAction(
  `[${featureName}] Load Contracts Failed`,
  props<{ error: any }>()
)

export const loadUsers = createAction(
  `[${featureName}] Load Users`,
  props<{ contractId: string }>()
)
export const loadUsersSucceeded = createAction(
  `[${featureName}] Load Users Succeeded`,
  props<{ response: PagedResponse<User> }>()
)
export const loadUsersFailed = createAction(
  `[${featureName}] Load Users Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadMintOperationRequests = createAction(
  `[${featureName}] Load Mint Operation Requests`
)

export const loadOpenMintOperationRequests = createAction(
  `[${featureName}] Load Open Mint Operation Requests`,
  props<{ page?: number }>()
)
export const loadApprovedMintOperationRequests = createAction(
  `[${featureName}] Load Approved Mint Operation Requests`,
  props<{ page?: number }>()
)
export const loadInjectedMintOperationRequests = createAction(
  `[${featureName}] Load Injected Mint Operation Requests`,
  props<{ page?: number }>()
)

export const loadOpenMintOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Open Mint Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadApprovedMintOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Approved Mint Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadInjectedMintOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Injected Mint Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)

export const loadMintOperationRequestsFailed = createAction(
  `[${featureName}] Load Mint Operation Requests Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadBurnOperationRequests = createAction(
  `[${featureName}] Load Burn Operation Requests`
)

export const loadOpenBurnOperationRequests = createAction(
  `[${featureName}] Load Open Burn Operation Requests`,
  props<{ page?: number }>()
)
export const loadApprovedBurnOperationRequests = createAction(
  `[${featureName}] Load Approved Burn Operation Requests`,
  props<{ page?: number }>()
)
export const loadInjectedBurnOperationRequests = createAction(
  `[${featureName}] Load Injected Burn Operation Requests`,
  props<{ page?: number }>()
)

export const loadOpenBurnOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Open Burn Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadApprovedBurnOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Approved Burn Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadInjectedBurnOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Injected Burn Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)

export const loadBurnOperationRequestsFailed = createAction(
  `[${featureName}] Load Burn Operation Requests Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadUpdateKeyholdersOperationRequests = createAction(
  `[${featureName}] Load Update Keyholders Operation Requests`
)

export const loadOpenUpdateKeyholdersOperationRequests = createAction(
  `[${featureName}] Load Open Update Keyholders Operation Requests`,
  props<{ page?: number }>()
)
export const loadApprovedUpdateKeyholdersOperationRequests = createAction(
  `[${featureName}] Load Approved Update Keyholders Operation Requests`,
  props<{ page?: number }>()
)
export const loadInjectedUpdateKeyholdersOperationRequests = createAction(
  `[${featureName}] Load Injected Update Keyholders Operation Requests`,
  props<{ page?: number }>()
)

export const loadOpenUpdateKeyholdersOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Open Update Keyholders Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadApprovedUpdateKeyholdersOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Approved Update Keyholders Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadInjectedUpdateKeyholdersOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Injected Update Keyholders Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)

export const loadUpdateKeyholdersOperationRequestsFailed = createAction(
  `[${featureName}] Load Update Keyholders Operation Requests Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const transferOperation = createAction(
  `[${featureName}] Starting Transfer Operation`,
  props<{ transferAmount: BigNumber; receivingAddress: string }>()
)
export const transferOperationSucceeded = createAction(
  `[${featureName}] Transferring Succeeded`
)
export const transferOperationFailed = createAction(
  `[${featureName}] Transferring Failed`,
  props<{ error: any }>()
)

export const submitOperationRequest = createAction(
  `[${featureName}] Submit Operation Request`,
  props<{ newOperationRequest: NewOperationRequest }>()
)
export const submitOperationRequestSucceeded = createAction(
  `[${featureName}] Submit Operation Request Succeeded`,
  props<{
    operationRequest: OperationRequest
  }>()
)
export const submitOperationRequestFailed = createAction(
  `[${featureName}] Submit Operation Request Failed`,
  props<{
    errorResponse: HttpErrorResponse
    newOperationRequest: NewOperationRequest
  }>()
)

export const getSignableMessage = createAction(
  `[${featureName}] Get Signable Message `,
  props<{ operationRequestId: string }>()
)
export const getSignableMessageSucceeded = createAction(
  `[${featureName}] Get Signable Message Succeeded`,
  props<{ signableMessage: SignableMessageInfo; operationRequestId: string }>()
)
export const getSignableMessageFailed = createAction(
  `[${featureName}] Get Signable Message Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const approveOperationRequest = createAction(
  `[${featureName}] Approve Operation Request`,
  props<{
    signableMessage: SignableMessageInfo
    operationRequest: OperationRequest
  }>()
)
export const approveOperationRequestSucceeded = createAction(
  `[${featureName}] Approve Operation Request Succeeded`,
  props<{ operationRequest: OperationRequest; signature: string }>()
)
export const approveOperationRequestFailed = createAction(
  `[${featureName}] Approve Operation Request Failed`,
  props<{ error: any }>()
)

export const submitOperationApproval = createAction(
  `[${featureName}] Submit Operation Approval`,
  props<{ operationRequest: OperationRequest; signature: string }>()
)
export const submitOperationApprovalSucceeded = createAction(
  `[${featureName}] Submit Operation Approval Succeeded`,
  props<{
    operationApproval: OperationApproval
    operationRequest: OperationRequest
  }>()
)
export const submitOperationApprovalFailed = createAction(
  `[${featureName}] Submit Operation Approval Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const getOperationRequestParameters = createAction(
  `[${featureName}] Get Operation Request Parameters`,
  props<{ operationRequest: OperationRequest }>()
)
export const getOperationRequestParametersSucceeded = createAction(
  `[${featureName}] Get Operation Request Parameters Succeeded`,
  props<{ operationRequest: OperationRequest; parameters: any }>()
)
export const getOperationRequestParametersFailed = createAction(
  `[${featureName}] Get Operation Request ParametersFailed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const submitOperation = createAction(
  `[${featureName}] Submit Operation`,
  props<{
    operationRequest: OperationRequest
    operation: RequestOperationInput
  }>()
)
export const submitOperationSucceeded = createAction(
  `[${featureName}] Submit Operation Succeeded`,
  props<{
    operationRequest: OperationRequest
    operationResponse: OperationResponseOutput
  }>()
)
export const submitOperationFailed = createAction(
  `[${featureName}] Submit Operation Failed`,
  props<{ error: any }>()
)

export const updateOperationRequestStateToInjected = createAction(
  `[${featureName}] Update Operation Request State to Injected`,
  props<{
    operationRequest: OperationRequest
    injectedOperationHash: string | null
  }>()
)
export const updateOperationRequestStateToInjectedSucceeded = createAction(
  `[${featureName}] Update Operation Request State to Injected Succeeded`,
  props<{ operationRequest: OperationRequest }>()
)
export const updateOperationRequestStateToInjectedFailed = createAction(
  `[${featureName}] Update Operation Request State to Injected Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const deleteOperationRequest = createAction(
  `[${featureName}] Delete Operation Request`,
  props<{ operationRequest: OperationRequest }>()
)
export const deleteOperationRequestSucceeded = createAction(
  `[${featureName}] Delete Operation Request Succeeded`,
  props<{ operationRequest: OperationRequest }>()
)
export const deleteOperationRequestFailed = createAction(
  `[${featureName}] Delete Operation Request Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const setActiveContract = createAction(
  `[${featureName}] Setting Active Contract`,
  props<{ contract: Contract }>()
)
export const setActiveContractSucceeded = createAction(
  `[${featureName}] Setting Active Contract Succeeded`,
  props<{ contract: Contract }>()
)
export const setActiveContractFailed = createAction(
  `[${featureName}] Setting Active Contract Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadRedeemAddress = createAction(
  `[${featureName}] Load Redeem Address`,
  props<{ contract: Contract }>()
)
export const loadRedeemAddressSucceeded = createAction(
  `[${featureName}] Load Redeem Address Succeeded`,
  props<{ address: string }>()
)
export const loadRedeemAddressFailed = createAction(
  `[${featureName}] Load Redeem Address Failed`,
  props<{ error: any }>()
)

export const loadRedeemAddressBalance = createAction(
  `[${featureName}] Load Redeem Address Balance`
)
export const loadRedeemAddressBalanceSucceeded = createAction(
  `[${featureName}] Load Redeem Address Balance Succeeded`,
  props<{ balance: BigNumber | undefined }>()
)
export const loadRedeemAddressBalanceFailed = createAction(
  `[${featureName}] Load Redeem Address Balance Failed`,
  props<{ error: any }>()
)

export const showAlert = createAction(
  `[${featureName}] setting New Alert Message`,
  props<{ alertMessage: ErrorDescription }>()
)
export const clearAlerts = createAction(`[${featureName}] Clearing Alerts`)

export const updateKeyholdersToRemove = createAction(
  `[${featureName}] Update keyholders to remove`,
  props<{ keyholder: User }>()
)
export const resetKeyholdersToRemove = createAction(
  `[${featureName}] Reset keyholders to remove`
)

export const updateKeyholdersToAdd = createAction(
  `[${featureName}] Update keyholders to add`,
  props<{ keyholder: string }>()
)
export const resetKeyholdersToAdd = createAction(
  `[${featureName}] Reset keyholders to add`
)

export const updateThreshold = createAction(
  `[${featureName}] Update threshold`,
  props<{ threshold: number }>()
)
export const resetThreshold = createAction(`[${featureName}] Reset threshold`)

export const noOp = createAction(`[${featureName}] Nothing to do`)

export const loadOperationRequestPage = createAction(
  `[${featureName}] Loading More Requests`,
  props<{
    kind: OperationRequestKind
    state: OperationRequestState
    page: number
  }>()
)
