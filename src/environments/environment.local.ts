import { NetworkType } from '@airgap/beacon-sdk'

export const environment = {
  production: false,
  nodeUrl: 'https://tezos-edonet-node.prod.gke.papers.tech',
  wrappedBackendUrl: 'http://localhost:8080',
  tezosNetworktype: NetworkType.EDONET,
}
