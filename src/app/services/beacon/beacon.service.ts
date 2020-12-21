import { Injectable } from '@angular/core'
import {
  Network,
  NetworkType,
  OperationResponseOutput,
  PermissionScope,
  RequestOperationInput,
  SignPayloadResponseOutput,
} from '@airgap/beacon-sdk'
import { TezosToolkit, WalletContract } from '@taquito/taquito'
import { Observable, of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../app.actions'
// import { rpcURLMainnet } from "src/app/app.module";
const tezos = new TezosToolkit('https://testnet-tezos.giganode.io')

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  public userAddress: string | undefined
  public balance: BigNumber | undefined
  public contractInstance: WalletContract | undefined
  public scopes: PermissionScope[] | undefined

  public wallet: BeaconWallet
  public network: Network = { type: NetworkType.DELPHINET }
  public contractAddress = 'KT1Q66HBBQYaHGAKnxeuedkgLyJYF9jkD96H' //TODO: replace with value from backend

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.wallet = new BeaconWallet({ name: 'Foundry' })

    // localStorage.clear();
  }

  // async clearActiveAccount() {
  //   try {
  //     await this.wallet.clearActiveAccount();
  //   } catch (error) {
  //     console.log("clearing active account failed: ", error);
  //   }
  // }

  // async disconnectActiveAccount() {
  //   try {
  //     await this.wallet.disconnect();
  //   } catch (error) {
  //     console.log("disconnecting active account failed: ", error);
  //   }
  // }

  async setupBeaconWallet() {
    try {
      tezos.setWalletProvider(this.wallet)
      const activeAccount = await this.wallet.client.getActiveAccount()
      if (activeAccount) {
        this.userAddress = await activeAccount.address
        this.store$.dispatch(actions.loadAddress())
      }
    } catch (error) {
      console.log('Setting up BeaconWallet failed: ', error)
    }
  }

  async requestPermission() {
    console.log('connecting')
    try {
      // requesting permissions
      await this.wallet.requestPermissions({ network: this.network })

      tezos.setWalletProvider(this.wallet)
      this.userAddress = await this.wallet.getPKH()

      this.store$.dispatch(actions.loadAddress())

      this.balance = new BigNumber(
        (await tezos.tz.getBalance(this.userAddress)).toString(10)
      )
    } catch (error) {
      console.log('requesting permission failed: ', error)
    }
  }

  async transferOperation(amount: number, receivingAddress: string) {
    try {
      this.contractInstance = await tezos.wallet.at(this.contractAddress)
      console.log('contract instance: ', this.contractInstance)
      const pkhSrc = await this.wallet.getPKH()
      console.log('pkhsrc: ', pkhSrc)

      try {
        const operation = await this.contractInstance.methods
          .transfer(
            pkhSrc,
            receivingAddress,
            new BigNumber(amount).shiftedBy(6).toFixed()
          )
          .send()
        await operation.confirmation()
        const storage: Storage = await this.contractInstance.storage()

        console.log((await storage.ledger.get(pkhSrc)).balance)
        console.log((await storage.ledger.get(this.userAddress)).balance)
      } catch (error) {
        console.log('confirmation failed: ', error)
      }
    } catch (error) {
      console.log('transfer operation failed: ', error)
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

  getAddress(): Observable<string> {
    return of(this.userAddress ?? '')
  }
}
