import { NetworkType } from '@airgap/beacon-sdk'

export const environment = {
  production: false,
  nodeUrl: 'https://tezos-edonet-node.prod.gke.papers.tech',
  wrappedBackendUrl: 'https://tz-wrapped.dev.gke.papers.tech',
  tezosNetworktype: NetworkType.EDONET,
}
