import BigNumber from 'bignumber.js'

export const convertBalanceToUIString = (
  balance: BigNumber,
  decimals: number
) => {
  return balance.shiftedBy(-1 * decimals)
}

export const convertUIStringToBalance = (text: string, decimals: number) => {
  return new BigNumber(text).shiftedBy(decimals)
}
