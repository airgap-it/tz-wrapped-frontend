export enum ErrorKind {
  NotFound = 'NotFound',
  InvalidSignature = 'InvalidSignature',
  DBError = 'DBError',
  InvalidPublicKey = 'InvalidPublicKey',
  Internal = 'Internal',
  InvalidOperationRequest = 'InvalidOperationRequest',
  InvalidOperationState = 'InvalidOperationState',
  InvalidValue = 'InvalidValue',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  AuthenticationChallengeExpired = 'AuthenticationChallengeExpired',
  Unknown = 'Unknown',
}

export interface APIError {
  code: number
  error: ErrorKind
  message: string
}

export function isAPIError(error: any): error is APIError {
  return (
    'code' in error &&
    'error' in error &&
    'message' in error &&
    typeof error.code === 'number' &&
    typeof error.message === 'string' &&
    Object.values(ErrorKind).includes(error.error)
  )
}
