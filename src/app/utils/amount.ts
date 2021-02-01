import { AbstractControl, ValidatorFn } from '@angular/forms'
import BigNumber from 'bignumber.js'

export const convertBigNumberToAmount = (
  balance: BigNumber,
  decimals: number
): string => {
  return balance.shiftedBy(-1 * decimals).toString(10)
}

export const convertAmountToBigNumber = (
  text: string,
  decimals: number
): BigNumber => {
  const bn = new BigNumber(text)
  if (bn.isNaN()) {
    throw new Error(`Invalid amount: ${text}`)
  }
  return bn.shiftedBy(decimals)
}

export function amountValidator(max: BigNumber, decimals: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const current = new BigNumber(control.value).shiftedBy(decimals)
    const isValid = current.lte(max)
    return !isValid ? { invalidValue: { value: control.value } } : null
  }
}
