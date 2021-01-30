export const validateAddress = (address: string | undefined | null) => {
  if (
    address === undefined ||
    address === null ||
    address.length !== 36 ||
    !address.startsWith('tz1')
  ) {
    throw new Error(`Invalid address: ${address}`)
  }
}
