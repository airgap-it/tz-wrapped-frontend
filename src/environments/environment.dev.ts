import { NetworkType } from '@airgap/beacon-sdk'

export const environment = {
  production: false,
  nodeUrl: 'https://testnet-tezos.giganode.io',
  wrappedBackendUrl: 'https://tz-wrapped.dev.gke.papers.tech',
  tezosNetworktype: NetworkType.DELPHINET,
}