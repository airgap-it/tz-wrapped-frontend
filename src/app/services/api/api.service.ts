import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

export enum UserState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserKind {
  GATEKEEPER = 'gatekeeper',
  KEYHOLDER = 'keyholder',
}

export enum OperationRequestKind {
  MINT = 'mint',
  BURN = 'burn',
}

export enum OperationRequestState {
  OPEN = 'open',
  APPROVED = 'approved',
  INJECTED = 'injected',
}

export interface PagedResponse<T> {
  page: number
  total_pages: number
  results: T[]
}

export enum ContractKind {
  FA1 = 'fa1',
  FA2 = 'fa2',
}

export interface Contract {
  id: string
  created_at: string
  updated_at: string
  pkh: string
  token_id: number
  multisig_pkh: string
  kind: ContractKind
  display_name: string
  decimals: number
  min_approvals: number
}

export interface User {
  id: string
  created_at: string
  updated_at: string
  public_key: string
  address: string
  contract_id: string
  kind: UserKind
  state: UserState
  display_name: string
}

export interface NewOperationRequest {
  contract_id: string
  target_address: string | null
  amount: number
  kind: string
  signature: string
  chain_id: string
  nonce: number
}

export interface SignableOperationRequest {
  unsigned_operation_request: NewOperationRequest
  signable_message_info: SignableMessageInfo
}

export interface SignableMessageInfo {
  message: string
  tezos_client_command: string
  blake2b_hash: string
}

export interface OperationRequest {
  id: string
  created_at: string
  updated_at: string
  gatekeeper: User
  contract_id: string
  target_address: string | null
  amount: string
  kind: string
  signature: string
  chain_id: string
  nonce: number
  state: OperationRequestState
  operation_hash?: any
}

export interface OperationApproval {
  id: string
  created_at: string
  updated_at: string
  keyholder: User
  operation_request_id: string
  signature: string
}

export interface NewOperationApproval {
  operation_request_id: string
  signature: string
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private static contractsPath = '/contracts'
  private static usersPath = '/users'
  private static operationRequestsPath = '/operation-requests'
  private static operationApprovalsPath = '/operation-approvals'

  constructor(private readonly http: HttpClient) {}

  getContracts(): Observable<PagedResponse<Contract>> {
    return this.http.get<PagedResponse<Contract>>(
      this.getUrl(ApiService.contractsPath)
    )
  }

  getUsers(
    contractId: string,
    address?: string
  ): Observable<PagedResponse<User>> {
    const path = `${ApiService.usersPath}?contract_id=${contractId}${
      address ? `&address=${address}` : ``
    }`
    return this.http.get<PagedResponse<User>>(this.getUrl(path))
  }

  getOperationRequests(
    contractId: string,
    operationKind: OperationRequestKind
  ): Observable<PagedResponse<OperationRequest>> {
    const path = `${ApiService.operationRequestsPath}?kind=${operationKind}&contract_id=${contractId}`
    return this.http.get<PagedResponse<OperationRequest>>(this.getUrl(path))
  }

  getOperationApprovals(
    requestId: string
  ): Observable<PagedResponse<OperationApproval>> {
    const path = `${ApiService.operationApprovalsPath}?operation_request_id=${requestId}`
    return this.http.get<PagedResponse<OperationApproval>>(this.getUrl(path))
  }

  getSignableMessage(
    operationRequestId: string
  ): Observable<SignableMessageInfo> {
    const path = `${ApiService.operationRequestsPath}/${operationRequestId}/signable-message`
    return this.http.get<SignableMessageInfo>(this.getUrl(path))
  }

  getParameters(operationRequestId: string): Observable<any> {
    const path = `${ApiService.operationRequestsPath}/${operationRequestId}/parameters`
    return this.http.get<any>(this.getUrl(path))
  }

  getContractNonce(contractId: string): Observable<any> {
    const path = `${ApiService.contractsPath}/${contractId}/nonce`
    return this.http.get<any>(this.getUrl(path))
  }

  getSignableOperationRequest(
    contractId: string,
    kind: OperationRequestKind,
    amount: string,
    targetAddress?: string
  ): Observable<SignableOperationRequest> {
    const path = `${
      ApiService.contractsPath
    }/${contractId}/signable-message?kind=${kind}&amount=${amount}${
      kind === OperationRequestKind.MINT && targetAddress !== undefined
        ? `&target_address=${targetAddress}`
        : ''
    }`
    return this.http.get<SignableOperationRequest>(this.getUrl(path))
  }

  addOperationApproval(
    approval: NewOperationApproval
  ): Observable<OperationApproval> {
    if (approval.signature.length === 0) {
      throw new Error('No signature provided')
    }
    return this.http.post<OperationApproval>(
      this.getUrl(ApiService.operationApprovalsPath),
      approval
    )
  }

  addOperationRequest(
    operation: NewOperationRequest
  ): Observable<OperationRequest> {
    return this.http.post<OperationRequest>(
      this.getUrl(ApiService.operationRequestsPath),
      operation
    )
  }

  updateOperationRequest(operationId: string, operationHash: string) {
    return this.http.patch<void>(
      this.getUrl(ApiService.operationRequestsPath + '/' + operationId),
      {
        operation_hash: operationHash,
      }
    )
  }

  // method created to ease testing
  private getUrl(path: string): string {
    return `${environment.wrappedBackendUrl}/api/v1${path}`
  }
}
