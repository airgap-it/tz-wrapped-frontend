export const validateAddress = (address: string | undefined | null) => {
  if (
    address === undefined ||
    address === null ||
    address.length !== 36 ||
    (!address.startsWith('tz1') &&
      !address.startsWith('tz2') &&
      !address.startsWith('tz3') &&
      !address.startsWith('KT1'))
  ) {
    throw new Error(`Invalid address: ${address}`)
  }
}
