import { SignableMessageInfo } from './common'
import { OperationApproval } from './operationApproval'
import { User } from './user'

export enum OperationRequestKind {
  MINT = 'mint',
  BURN = 'burn',
  UPDATE_KEYHOLDERS = 'update_keyholders',
  ADD_OPERATOR = 'add_operator',
  REMOVE_OPERATOR = 'remove_operator',
  SET_REDEEM_ADDRESS = 'set_redeem_address',
  TRANSFER_OWNERSHIP = 'transfer_ownership',
  ACCEPT_OWNERSHIP = 'accept_ownership',
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
  user: User
  contract_id: string
  target_address: string | null
  amount: string | null
  threshold: number | null
  proposed_keyholders: User[] | null
  kind: string
  chain_id: string
  nonce: number
  state: OperationRequestState
  operation_approvals: OperationApproval[]
  operation_hash: string | null
}

export interface NewOperationRequest {
  contract_id: string
  target_address: string | null
  amount: string | null
  threshold: number | null
  proposed_keyholders: string[] | null
  kind: string
  ledger_hash: string | null
}
