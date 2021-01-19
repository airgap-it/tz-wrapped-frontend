import { createAction, props } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'
import {
  OperationApproval,
  Contract,
  SignableOperationRequest,
  OperationRequest,
  NewOperationRequest,
  PagedResponse,
  NewOperationApproval,
  User,
  OperationRequestKind,
  SignableMessageInfo,
} from './services/api/api.service'
import {
  AccountInfo,
  OperationResponseOutput,
  RequestOperationInput,
} from '@airgap/beacon-sdk'
import BigNumber from 'bignumber.js'
import { Tab } from './pages/dashboard/dashboard.component'

const featureName = 'App'

export const selectTab = createAction(
  `[${featureName}] Select Tab`,
  props<{ tab: Tab }>()
)

export const saveLatestRoute = createAction(
  `[${featureName}] Save Latest Route`,
  props<{ navigation: NavigationEnd }>()
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
  props<{ error: any }>()
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
  props<{ error: any }>()
)

export const loadMintOperationRequests = createAction(
  `[${featureName}] Load Mint Operation Requests`,
  props<{ contractId: string }>()
)
export const loadMintOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Mint Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadMintOperationRequestsFailed = createAction(
  `[${featureName}] Load Mint Operation Requests Failed`,
  props<{ error: any }>()
)

export const loadBurnOperationRequests = createAction(
  `[${featureName}] Load Burn Operation Requests`,
  props<{ contractId: string }>()
)
export const loadBurnOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Burn Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadBurnOperationRequestsFailed = createAction(
  `[${featureName}] Load Burn Operation Requests Failed`,
  props<{ error: any }>()
)

export const loadOperationApprovals = createAction(
  `[${featureName}] Load Operation Approvals`,
  props<{ operationRequestId: string }>()
)
export const loadOperationApprovalsSucceeded = createAction(
  `[${featureName}] Load Operation Approvals Succeeded`,
  props<{
    operationRequestId: string
    response: PagedResponse<OperationApproval>
  }>()
)
export const loadOperationApprovalsFailed = createAction(
  `[${featureName}] Load Operation Approvals Failed`,
  props<{ error: any }>()
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

export const getSignableOperationRequest = createAction(
  `[${featureName}] Get Signable Operation Request`,
  props<{
    contractId: string
    kind: OperationRequestKind
    amount: string
    targetAddress?: string
  }>()
)
export const getSignableOperationRequestSucceeded = createAction(
  `[${featureName}] Get Signable Operation Request Succeeded`,
  props<{ response: SignableOperationRequest; contractId: string }>()
)
export const getSignableOperationRequestFailed = createAction(
  `[${featureName}] Get Signable Operation Request Failed`,
  props<{ error: any }>()
)

export const signOperationRequest = createAction(
  `[${featureName}] Sign Operation Request`,
  props<{ response: SignableOperationRequest; contractId: string }>()
)
export const signOperationRequestSucceeded = createAction(
  `[${featureName}] Sign Operation Request Succeeded`,
  props<{
    response: SignableOperationRequest
    signature: string
    contractId: string
  }>()
)
export const signOperationRequestFailed = createAction(
  `[${featureName}] Sign Operation Request Failed`,
  props<{ error: any }>()
)

export const submitSignedOperationRequest = createAction(
  `[${featureName}] Submit Operation Request`,
  props<{ request: NewOperationRequest; contractId: string }>()
)
export const submitSignedOperationRequestSucceeded = createAction(
  `[${featureName}] Submit Operation Request Succeeded`,
  props<{
    response: OperationRequest
  }>()
)
export const submitSignedOperationRequestFailed = createAction(
  `[${featureName}] Submit Operation Request Failed`,
  props<{ error: any }>()
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
  props<{ error: any }>()
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
  props<{ error: any }>()
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
  props<{ error: any }>()
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
    response: OperationResponseOutput
  }>()
)
export const submitOperationFailed = createAction(
  `[${featureName}] Submit Operation Failed`,
  props<{ error: any }>()
)

export const updateOperationWithHash = createAction(
  `[${featureName}] Update Operation With Hash`,
  props<{
    operationRequest: OperationRequest
    response: OperationResponseOutput
  }>()
)
export const updateOperationWithHashSucceeded = createAction(
  `[${featureName}] Update Operation With Hash Succeeded`,
  props<{ operationRequest: OperationRequest }>()
)
export const updateOperationWithHashFailed = createAction(
  `[${featureName}] Update Operation With Hash Failed`,
  props<{ error: any }>()
)

export const setActiveContract = createAction(
  `[${featureName}] Setting Active Contract`,
  props<{ contract: Contract }>()
)

export const setActiveContractSucceeded = createAction(
  `[${featureName}] Setting Active Contract Succeeded`
)
