import { Injectable } from '@angular/core'
import {
  AccountInfo,
  Network,
  OperationResponseOutput,
  PermissionScope,
  RequestOperationInput,
  SignPayloadResponseOutput,
} from '@airgap/beacon-sdk'
import {
  TezosToolkit,
  TransactionWalletOperation,
  WalletContract,
} from '@taquito/taquito'
import BigNumber from 'bignumber.js'
import { BeaconWallet } from '@taquito/beacon-wallet'

import { RpcClient } from '@taquito/rpc'
import { Uint8ArrayConsumer } from '@taquito/local-forging'
import { Contract, ContractKind } from '../api/api.service'
import { environment } from 'src/environments/environment'
const codec = require('@taquito/local-forging/dist/lib/michelson/codec')

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  public balance: BigNumber | undefined
  public contractInstance: WalletContract | undefined
  public scopes: PermissionScope[] | undefined

  public wallet: BeaconWallet
  public network: Network
  public rpcURL: string
  public tezos: TezosToolkit

  constructor() {
    this.rpcURL = environment.nodeUrl
    this.network = {
      type: environment.tezosNetworktype,
      rpcUrl: environment.nodeUrl,
    }

    this.tezos = new TezosToolkit(this.rpcURL)
    this.wallet = new BeaconWallet({ name: 'Foundry' })
  }

  async setupBeaconWallet(): Promise<AccountInfo | undefined> {
    try {
      this.tezos.setWalletProvider(this.wallet)
      return await this.wallet.client.getActiveAccount()
    } catch (error) {
      console.error('Setting up BeaconWallet failed: ', error)
      return undefined
    }
  }

  async requestPermission(): Promise<AccountInfo | undefined> {
    await this.wallet.requestPermissions({ network: this.network })
    return this.wallet.client.getActiveAccount()
  }

  async transferOperation(
    amount: BigNumber,
    receivingAddress: string,
    contract: Contract
  ): Promise<void> {
    try {
      let contractInstance = await this.tezos.wallet.at(contract.pkh)
      const pkhSrc = await this.wallet.getPKH()

      try {
        let operation: TransactionWalletOperation
        switch (contract.kind) {
          case ContractKind.FA1: {
            operation = await contractInstance.methods
              .transfer(pkhSrc, receivingAddress, amount.toFixed())
              .send()
          }
          case ContractKind.FA2: {
            operation = await contractInstance.methods
              .transfer([
                {
                  from_: pkhSrc,
                  txs: [
                    {
                      to_: receivingAddress,
                      token_id: contract.token_id,
                      amount: amount.toFixed(),
                    },
                  ],
                },
              ])
              .send()
          }
        }
        await operation.confirmation()
      } catch (error) {
        console.error('confirmation failed: ', error)
      }
    } catch (error) {
      console.error('transfer operation failed: ', error)
    }
  }

  async sign(message: string): Promise<SignPayloadResponseOutput> {
    return this.wallet.client.requestSignPayload({
      payload: message,
    })
  }

  async operation(
    input: RequestOperationInput
  ): Promise<OperationResponseOutput> {
    return this.wallet.client.requestOperation(input)
  }

  async reset(): Promise<void> {
    return this.wallet.clearActiveAccount()
  }

  async getBalance(
    address: string,
    contract: Contract
  ): Promise<BigNumber | undefined> {
    if (contract.kind === ContractKind.FA1) {
      return await this.getFA1Balance(contract, address).catch(
        (error) => undefined
      )
    } else if (contract.kind === ContractKind.FA2) {
      return await this.getFA2Balance(contract, address).catch(
        (error) => undefined
      )
    }
  }

  private async getFA1Balance(contract: Contract, userAddress: string) {
    const client = new RpcClient(this.rpcURL)

    const packedData = await client.packData({
      data: {
        prim: 'Pair',
        args: [{ string: 'ledger' }, { string: userAddress }],
      },
      type: {
        prim: 'pair',
        args: [{ prim: 'string' }, { prim: 'address' }],
      },
    })

    const contractInstance = await this.tezos.wallet.at(contract.pkh)
    const storage: any = await contractInstance.storage()
    const value: any = await storage['0'].get(packedData.packed)

    const response = codec.valueDecoder(
      Uint8ArrayConsumer.fromHexString(value.slice(2))
    )

    return new BigNumber(response.args[0].int)
  }

  private async getFA2Balance(contract: Contract, userAddress: string) {
    try {
      const contractInstance = await this.tezos.wallet.at(contract.pkh)
      const storage: Storage = await contractInstance.storage()

      return new BigNumber(
        await storage.ledger.get({
          token_id: contract.token_id,
          owner: userAddress,
        })
      )
    } catch (e) {
      console.error(e)
    }
  }
}
