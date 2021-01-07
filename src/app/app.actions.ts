import { createAction, props } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'
import {
  Approval,
  Contract,
  MintBurnRequestResponse,
  Operation,
  OperationRequest,
  PagedResponse,
  SignableMessage,
  SignableMessageRequest,
  User,
} from './services/api/api.service'
import {
  OperationRequestInput,
  OperationResponseOutput,
  RequestOperationInput,
} from '@airgap/beacon-sdk'
import BigNumber from 'bignumber.js'

const featureName = 'App'

export const saveLatestRoute = createAction(
  `[${featureName}] Save Latest Route`,
  props<{ navigation: NavigationEnd }>()
)
export const connectWallet = createAction(
  `[${featureName}] Connect Wallet with Beacon`
)
export const connectWalletSucceeded = createAction(
  `[${featureName}] Connect Wallet with Beacon Succeeded`
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

export const loadMintingRequests = createAction(
  `[${featureName}] Load Minting Requests`,
  props<{ contractId: string }>()
)
export const loadMintingRequestsSucceeded = createAction(
  `[${featureName}] Load Minting Requests Succeeded`,
  props<{ response: PagedResponse<Operation> }>()
)
export const loadMintingRequestsFailed = createAction(
  `[${featureName}] Load Minting Requests Failed`,
  props<{ error: any }>()
)

export const loadBurningRequests = createAction(
  `[${featureName}] Load Burning Requests`,
  props<{ contractId: string }>()
)
export const loadBurningRequestsSucceeded = createAction(
  `[${featureName}] Load Burning Requests Succeeded`,
  props<{ response: PagedResponse<Operation> }>()
)
export const loadBurningRequestsFailed = createAction(
  `[${featureName}] Load Burning Requests Failed`,
  props<{ error: any }>()
)

export const loadApprovals = createAction(
  `[${featureName}] Load Approvals`,
  props<{ requestId: string }>()
)
export const loadApprovalsSucceeded = createAction(
  `[${featureName}] Load Approvals Succeeded`,
  props<{ requestId: string; response: PagedResponse<Approval> }>()
)
export const loadApprovalsFailed = createAction(
  `[${featureName}] Load Approvals Failed`,
  props<{ error: any }>()
)

export const transferOperation = createAction(
  `[${featureName}] Starting Transfer Operation`,
  props<{ transferAmount: number; receivingAddress: string }>()
)
export const transferOperationSucceeded = createAction(
  `[${featureName}] Transferring Succeeded`
)
export const transferOperationFailed = createAction(
  `[${featureName}] Transferring Failed`,
  props<{ error: any }>()
)

export const requestBurnOperation = createAction(
  `[${featureName}] Starting Burn Operation Request`,
  props<{ contractId: string; burnAmount: string }>()
)
export const requestBurnOperationSucceeded = createAction(
  `[${featureName}] Burning Request Succeeded`,
  props<{ response: MintBurnRequestResponse; contractId: string }>()
)
export const requestBurnOperationFailed = createAction(
  `[${featureName}] Burning Request Failed`,
  props<{ error: any }>()
)

export const signBurnOperationRequest = createAction(
  `[${featureName}] Starting Sign Burn Operation Request`,
  props<{ response: MintBurnRequestResponse; contractId: string }>()
)
export const signBurnOperationRequestSucceeded = createAction(
  `[${featureName}] Sign Burn Operation Request Succeeded`,
  props<{
    response: MintBurnRequestResponse
    signature: string
    contractId: string
  }>()
)
export const signBurnOperationRequestFailed = createAction(
  `[${featureName}] Sign Burn Operation Request Failed`,
  props<{ error: any }>()
)

export const submitSignedBurningRequest = createAction(
  `[${featureName}] Starting Submit Burning Request`,
  props<{ request: OperationRequest; contractId: string }>()
)
export const submitSignedBurningRequestSucceeded = createAction(
  `[${featureName}] Submit Burning Request Succeeded`
)
export const submitSignedBurningRequestFailed = createAction(
  `[${featureName}] Submit Burning Request Failed`,
  props<{ error: any }>()
)

export const requestApproveBurnOperation = createAction(
  `[${featureName}] Request Approve Burn Operation `,
  props<{ requestId: string }>()
)
export const requestApproveBurnOperationSucceeded = createAction(
  `[${featureName}] Request Approve Burn Operation Succeeded`,
  props<{ response: SignableMessageRequest }>()
)
export const requestApproveBurnOperationFailed = createAction(
  `[${featureName}] Request Approve Burn Operation Failed`,
  props<{ error: any }>()
)

export const signApproveBurnOperationRequest = createAction(
  `[${featureName}] Sign Approve Burn Operation Request `,
  props<{ response: SignableMessageRequest }>()
)
export const signApproveBurnOperationRequestSucceeded = createAction(
  `[${featureName}] Sign Approve Burn Operation Request Succeeded`,
  props<{ response: SignableMessageRequest; signature: string }>()
)
export const signApproveBurnOperationRequestFailed = createAction(
  `[${featureName}] Sign Approve Burn Operation Request Failed`,
  props<{ error: any }>()
)

export const submitSignedApproveBurnOperationRequest = createAction(
  `[${featureName}] Submit Signed Approve Burn Operation Request`,
  props<{ request: SignableMessageRequest; approval: SignableMessage }>()
)
export const submitSignedApproveBurnOperationRequestSucceeded = createAction(
  `[${featureName}] Submit Signed Approve Burn Operation RequestSucceeded`,
  props<{ request: SignableMessageRequest; approval: SignableMessage }>()
)
export const submitSignedApproveBurnOperationRequestFailed = createAction(
  `[${featureName}] Submit Signed Approve Burn Operation RequestFailed`,
  props<{ error: any }>()
)

export const getApprovedBurnParameters = createAction(
  `[${featureName}] Get Approved Burn Parameters`,
  props<{ operationId: string }>()
)
export const getApprovedBurnParametersSucceeded = createAction(
  `[${featureName}] Get Approved Burn ParametersSucceeded`,
  props<{ parameters: any }>()
)
export const getApprovedBurnParametersFailed = createAction(
  `[${featureName}] Get Approved Burn ParametersFailed`,
  props<{ error: any }>()
)

export const signApprovedBurn = createAction(
  `[${featureName}] Sign Approved Burn`,
  props<{ operation: RequestOperationInput }>()
)
export const signApprovedBurnSucceeded = createAction(
  `[${featureName}] Sign Approved BurnSucceeded`,
  props<{ response: OperationResponseOutput }>()
)
export const signApprovedBurnFailed = createAction(
  `[${featureName}] Sign Approved BurnFailed`,
  props<{ error: any }>()
)

export const requestMintOperation = createAction(
  `[${featureName}] Starting Mint Operation Request`,
  props<{ contractId: string; mintAmount: string; receivingAddress: string }>()
)
export const requestMintOperationSucceeded = createAction(
  `[${featureName}] Minting Request Succeeded`,
  props<{ response: MintBurnRequestResponse; contractId: string }>()
)
export const requestMintOperationFailed = createAction(
  `[${featureName}] Minting Request Failed`,
  props<{ error: any }>()
)

export const signMintOperationRequest = createAction(
  `[${featureName}] Starting Sign Mint Operation Request`,
  props<{ response: MintBurnRequestResponse; contractId: string }>()
)
export const signMintOperationRequestSucceeded = createAction(
  `[${featureName}] Sign Mint Operation Request Succeeded`,
  props<{
    response: MintBurnRequestResponse
    signature: string
    contractId: string
  }>()
)
export const signMintOperationRequestFailed = createAction(
  `[${featureName}] Sign Mint Operation Request Failed`,
  props<{ error: any }>()
)

export const submitSignedMintingRequest = createAction(
  `[${featureName}] Starting Submit Minting Request`,
  props<{ request: OperationRequest; contractId: string }>()
)
export const submitSignedMintingRequestSucceeded = createAction(
  `[${featureName}] Submit Minting Request Succeeded`
)
export const submitSignedMintingRequestFailed = createAction(
  `[${featureName}] Submit Minting Request Failed`,
  props<{ error: any }>()
)

export const requestApproveMintOperation = createAction(
  `[${featureName}] Request Approve Mint Operation `,
  props<{ requestId: string }>()
)
export const requestApproveMintOperationSucceeded = createAction(
  `[${featureName}] Request Approve Mint Operation Succeeded`,
  props<{ response: SignableMessageRequest }>()
)
export const requestApproveMintOperationFailed = createAction(
  `[${featureName}] Request Approve Mint Operation Failed`,
  props<{ error: any }>()
)

export const signApproveMintOperationRequest = createAction(
  `[${featureName}] Sign Approve Mint Operation Request `,
  props<{ response: SignableMessageRequest }>()
)
export const signApproveMintOperationRequestSucceeded = createAction(
  `[${featureName}] Sign Approve Mint Operation Request Succeeded`,
  props<{ response: SignableMessageRequest; signature: string }>()
)
export const signApproveMintOperationRequestFailed = createAction(
  `[${featureName}] Sign Approve Mint Operation Request Failed`,
  props<{ error: any }>()
)

export const submitSignedApproveMintOperationRequest = createAction(
  `[${featureName}] Submit Signed Approve Mint Operation Request`,
  props<{ request: SignableMessageRequest; approval: SignableMessage }>()
)
export const submitSignedApproveMintOperationRequestSucceeded = createAction(
  `[${featureName}] Submit Signed Approve Mint Operation RequestSucceeded`,
  props<{ request: SignableMessageRequest; approval: SignableMessage }>()
)
export const submitSignedApproveMintOperationRequestFailed = createAction(
  `[${featureName}] Submit Signed Approve Mint Operation RequestFailed`,
  props<{ error: any }>()
)

export const getApprovedMintParameters = createAction(
  `[${featureName}] Get Approved Mint Parameters`,
  props<{ operationId: string }>()
)
export const getApprovedMintParametersSucceeded = createAction(
  `[${featureName}] Get Approved Mint ParametersSucceeded`,
  props<{ parameters: any }>()
)
export const getApprovedMintParametersFailed = createAction(
  `[${featureName}] Get Approved Mint ParametersFailed`,
  props<{ error: any }>()
)

export const signApprovedMint = createAction(
  `[${featureName}] Sign Approved Mint`,
  props<{ operation: RequestOperationInput }>()
)
export const signApprovedMintSucceeded = createAction(
  `[${featureName}] Sign Approved MintSucceeded`,
  props<{ response: OperationResponseOutput }>()
)
export const signApprovedMintFailed = createAction(
  `[${featureName}] Sign Approved MintFailed`,
  props<{ error: any }>()
)

export const changeAsset = createAction(
  `[${featureName}] Changing Asset`,
  props<{ asset: string }>()
)
export const setActiveContract = createAction(
  `[${featureName}] Setting Active Contract`,
  props<{ contract: Contract }>()
)
