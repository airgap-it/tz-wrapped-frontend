import { NetworkType } from '@airgap/beacon-sdk'

export const environment = {
  production: true,
  nodeUrl: 'https://tezos-node.prod.gke.papers.tech',
  wrappedBackendUrl: 'https://foundry-backend.wrappedtz.io',
  tezosNetworktype: NetworkType.MAINNET,
}
