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
