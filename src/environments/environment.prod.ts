import { NetworkType } from '@airgap/beacon-sdk'

export const environment = {
  production: true,
  nodeUrl: 'https://mainnet-tezos.giganode.io',
  wrappedBackendUrl: 'https://tz-wrapped.prod.gke.papers.tech',
  tezosNetworktype: NetworkType.MAINNET,
}
