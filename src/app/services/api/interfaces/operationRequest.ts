import { SignableMessageInfo } from './common'
import { OperationApproval } from './operationApproval'
import { User } from './user'

export enum OperationRequestKind {
  MINT = 'mint',
  BURN = 'burn',
}

export enum OperationRequestState {
  OPEN = 'open',
  APPROVED = 'approved',
  INJECTED = 'injected',
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
  operation_approvals: OperationApproval[]
  operation_hash?: any
}

export interface NewOperationRequest {
  contract_id: string
  target_address: string | null
  amount: string
  kind: string
}
