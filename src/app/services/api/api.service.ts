import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

const URL = 'https://tz-wrapped.dev.gke.papers.tech'

export enum State {
  OPEN = 'open',
  ACTIVE = 'active',
  APPROVED = 'approved',
}

export enum UserKind {
  GATEKEEPER = 'gatekeeper',
  KEYHOLDER = 'keyholder',
}

export enum OperationKind {
  MINT = 'mint',
}

export interface PagedResponse<T> {
  page: number
  total_pages: number
  results: T[]
}

export interface Contract {
  id: string
  created_at: string
  updated_at: string
  pkh: string
  token_id: number
  multisig_pkh: string
  kind: UserKind
  display_name: string
}

export interface User {
  id: string
  created_at: string
  updated_at: string
  public_key: string
  address: string
  contract_id: string
  kind: UserKind
  state: State
  display_name: string
}

export interface OperationRequest {
  destination: string
  target_address: string
  amount: number
  kind: string
  gk_signature: string
  chain_id: string
  nonce: number
}

export interface MintResponse {
  operation_request: OperationRequest
  signable_message: string
}

export interface Operation {
  id: string
  created_at: string
  updated_at: string
  requester: User
  contract_id: string
  target_address: string
  amount: number
  kind: string
  gk_signature: string
  chain_id: string
  nonce: number
  state: string
  operation_hash?: any
}

export interface Approval {
  id: string
  created_at: string
  updated_at: string
  approver: User
  request_id: string
  kh_signature: string
}

export interface SignableMessage {
  request: string
  kh_signature: string
}

export interface SignableMessageRequest {
  operation_approval: SignableMessage
  signable_message: string
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getContracts(): Observable<PagedResponse<Contract>> {
    return this.http.get<PagedResponse<Contract>>(this.getUrl('contracts'))
  }

  getUsers(
    contractId: string,
    address?: string
  ): Observable<PagedResponse<User>> {
    const path = `users?contract_id=${contractId}${
      address ? `&address=${address}` : ``
    }`
    return this.http.get<PagedResponse<User>>(this.getUrl(path))
  }

  getOperations(
    contractId: string,
    operationKind: OperationKind
  ): Observable<PagedResponse<Operation>> {
    const path = `operations?kind=${operationKind}&contract_id=${contractId}`
    return this.http.get<PagedResponse<Operation>>(this.getUrl(path))
  }

  getApprovals(requestId: string): Observable<PagedResponse<Approval>> {
    const path = `approvals?request_id=${requestId}`
    return this.http.get<PagedResponse<Approval>>(this.getUrl(path))
  }

  getSignableMessage(contractId: string): Observable<SignableMessageRequest> {
    const path = `operations/${contractId}/signable-message`
    return this.http.get<SignableMessageRequest>(this.getUrl(path))
  }

  getParameters(contractId: string): Observable<any> {
    const path = `operations/${contractId}/parameters`
    return this.http.get<any>(this.getUrl(path))
  }

  mint(
    contractId: string,
    address: string,
    amount: string
  ): Observable<MintResponse> {
    const path = `contracts/${contractId}/signable-message?kind=${OperationKind.MINT}&target_address=${address}&amount=${amount}`
    console.log('starting mint', path)
    return this.http.get<MintResponse>(this.getUrl(path))
  }

  addApproval(approval: SignableMessage): Observable<MintResponse> {
    if (approval.kh_signature.length === 0) {
      throw new Error('No signature provided')
    }
    const path = `approvals`
    return this.http.post<MintResponse>(this.getUrl(path), approval)
  }

  addSignature(operation: OperationRequest): Observable<MintResponse> {
    const path = `operations`
    return this.http.post<MintResponse>(this.getUrl(path), operation)
  }

  // method created to ease testing
  private getUrl(path: string): string {
    return `${URL}/api/v1/${path}`
  }
}
