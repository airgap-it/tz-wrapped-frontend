export interface PagedResponse<T> {
  page: number
  total_pages: number
  results: T[]
}

export interface SignableMessageInfo {
  message: string
  tezos_client_command: string
  blake2b_hash: string
}
