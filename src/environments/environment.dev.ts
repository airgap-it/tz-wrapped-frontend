import { NetworkType } from '@airgap/beacon-sdk'

export const environment = {
  production: false,
  nodeUrl: 'https://edonet.smartpy.io',
  wrappedBackendUrl: 'https://tz-wrapped.dev.gke.papers.tech',
  tezosNetworktype: NetworkType.EDONET,
}
