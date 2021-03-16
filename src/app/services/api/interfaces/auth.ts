import { UserKind } from './user'

export interface SessionUserRole {
  contract_id: string
  kind: UserKind
}

export interface SessionUser {
  address: string
  display_name: string
  email: string | null
  roles: SessionUserRole[]
}

export interface AuthenticationChallenge {
  id: string
  message: string
}

export interface AuthenticationChallengeResponse {
  id: string
  signature: string
}
