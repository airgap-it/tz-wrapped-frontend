import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { User } from './interfaces/user'
import { Contract } from './interfaces/contract'
import { PagedResponse, SignableMessageInfo } from './interfaces/common'
import {
  NewOperationRequest,
  OperationRequest,
  OperationRequestKind,
  OperationRequestState,
} from './interfaces/operationRequest'
import {
  NewOperationApproval,
  OperationApproval,
} from './interfaces/operationApproval'
import {
  AuthenticationChallenge,
  AuthenticationChallengeResponse,
  SessionUser,
} from './interfaces/auth'

const pageLimit = 2

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private static authPath = '/auth'
  private static contractsPath = '/contracts'
  private static usersPath = '/users'
  private static operationRequestsPath = '/operation-requests'
  private static operationApprovalsPath = '/operation-approvals'

  constructor(private readonly http: HttpClient) {}

  getSignInChallenge(
    address: string
  ): Observable<AuthenticationChallenge | null> {
    const path = `${this.getUrl(ApiService.authPath)}?address=${address}`
    return this.http.get<AuthenticationChallenge | null>(path, {
      withCredentials: true,
    })
  }

  respondToSignInChallenge(
    challengeResponse: AuthenticationChallengeResponse
  ): Observable<SessionUser> {
    return this.http.post<SessionUser>(
      this.getUrl(ApiService.authPath),
      challengeResponse,
      { withCredentials: true }
    )
  }

  getSessionUser(): Observable<SessionUser> {
    const path = `${this.getUrl(ApiService.authPath)}/me`
    return this.http.get<SessionUser>(path, { withCredentials: true })
  }

  updateSessionUser(
    name: string,
    email: string | null
  ): Observable<SessionUser> {
    const path = `${this.getUrl(ApiService.authPath)}/me`
    return this.http.patch<SessionUser>(
      path,
      {
        display_name: name,
        email,
      },
      { withCredentials: true }
    )
  }

  signOut(): Observable<void> {
    return this.http.delete<void>(this.getUrl(ApiService.authPath), {
      withCredentials: true,
    })
  }

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
      address ? `&address=${address}` : ''
    }`
    return this.http.get<PagedResponse<User>>(this.getUrl(path), {
      withCredentials: true,
    })
  }

  getOperationRequests(
    contractId: string,
    operationKind: OperationRequestKind,
    operationState: OperationRequestState,
    page = 1,
    limit = pageLimit
  ): Observable<PagedResponse<OperationRequest>> {
    const path = `${ApiService.operationRequestsPath}?kind=${operationKind}&contract_id=${contractId}&state=${operationState}&page=${page}&limit=${limit}`
    return this.http.get<PagedResponse<OperationRequest>>(this.getUrl(path), {
      withCredentials: true,
    })
  }

  deleteOperationRequest(operationRequestId: string): Observable<void> {
    const path = `${ApiService.operationRequestsPath}/${operationRequestId}`
    return this.http.delete<void>(this.getUrl(path), {
      withCredentials: true,
    })
  }

  getOperationApprovals(
    requestId: string
  ): Observable<PagedResponse<OperationApproval>> {
    const path = `${ApiService.operationApprovalsPath}?operation_request_id=${requestId}`
    return this.http.get<PagedResponse<OperationApproval>>(this.getUrl(path), {
      withCredentials: true,
    })
  }

  getSignableMessage(
    operationRequestId: string
  ): Observable<SignableMessageInfo> {
    const path = `${ApiService.operationRequestsPath}/${operationRequestId}/signable-message`
    return this.http.get<SignableMessageInfo>(this.getUrl(path), {
      withCredentials: true,
    })
  }

  getParameters(operationRequestId: string): Observable<any> {
    const path = `${ApiService.operationRequestsPath}/${operationRequestId}/parameters`
    return this.http.get<any>(this.getUrl(path), { withCredentials: true })
  }

  getContractNonce(contractId: string): Observable<any> {
    const path = `${ApiService.contractsPath}/${contractId}/nonce`
    return this.http.get<any>(this.getUrl(path))
  }

  addOperationApproval(
    approval: NewOperationApproval
  ): Observable<OperationApproval> {
    if (approval.signature.length === 0) {
      throw new Error('No signature provided')
    }
    return this.http.post<OperationApproval>(
      this.getUrl(ApiService.operationApprovalsPath),
      approval,
      { withCredentials: true }
    )
  }

  addOperationRequest(
    operation: NewOperationRequest
  ): Observable<OperationRequest> {
    return this.http.post<OperationRequest>(
      this.getUrl(ApiService.operationRequestsPath),
      operation,
      { withCredentials: true }
    )
  }

  updateOperationRequest(
    operationId: string,
    operationHash: string | null
  ): Observable<void> {
    return this.http.patch<void>(
      this.getUrl(ApiService.operationRequestsPath + '/' + operationId),
      {
        operation_hash: operationHash,
      },
      { withCredentials: true }
    )
  }

  // method created to ease testing
  private getUrl(path: string): string {
    return `${environment.wrappedBackendUrl}/api/v1${path}`
  }
}
