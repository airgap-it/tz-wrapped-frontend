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
import { environment } from 'src/environments/environment'
import { Contract, ContractKind } from '../api/interfaces/contract'
const MichelsonCodec = require('@taquito/local-forging/dist/lib/michelson/codec')
const Codec = require('@taquito/local-forging/dist/lib/codec')

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
    let contractInstance = await this.tezos.wallet.at(contract.pkh)
    const pkhSrc = await this.wallet.getPKH()

    let operation: TransactionWalletOperation
    switch (contract.kind) {
      case ContractKind.FA1: {
        operation = await contractInstance.methods
          .transfer(pkhSrc, receivingAddress, amount.toFixed())
          .send()
        break
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
        break
      }
    }
    await operation.confirmation()
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

  async getRedeemAddress(contract: Contract): Promise<string> {
    switch (contract.kind) {
      case ContractKind.FA1:
        return await this.getFA1RedeemAddress(contract)
      case ContractKind.FA2:
        return await this.getFA2RedeemAddress(contract)
    }
  }

  private async getFA1RedeemAddress(contract: Contract): Promise<string> {
    const client = new RpcClient(this.rpcURL)
    const packedData = await client.packData({
      data: { string: 'redeemAddress' },
      type: { prim: 'string' },
    })

    const contractInstance = await this.tezos.wallet.at(contract.pkh)
    const storage: any = await contractInstance.storage()
    const value: any = await storage['0'].get(packedData.packed)
    const decodedValue = MichelsonCodec.valueDecoder(
      Uint8ArrayConsumer.fromHexString(value.slice(2))
    )
    const address = Codec.addressDecoder(
      Uint8ArrayConsumer.fromHexString(decodedValue.bytes)
    )
    return address
  }

  private async getFA2RedeemAddress(contract: Contract): Promise<string> {
    const contractInstance = await this.tezos.wallet.at(contract.pkh)
    const storage: any = await contractInstance.storage()
    return storage.redeem_address
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

    const decodedValue = MichelsonCodec.valueDecoder(
      Uint8ArrayConsumer.fromHexString(value.slice(2))
    )

    return new BigNumber(decodedValue.args[0].int)
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
