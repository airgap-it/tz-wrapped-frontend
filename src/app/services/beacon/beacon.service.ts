import { Injectable } from "@angular/core";
import { PermissionScope } from "@airgap/beacon-sdk";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Tezos } from "@taquito/taquito";
import { Observable, of } from "rxjs";
import { NetworkType } from "@taquito/beacon-wallet/node_modules/@airgap/beacon-sdk/dist/types/beacon/NetworkType";

@Injectable({
  providedIn: "root",
})
export class BeaconService {
  public address: string | null = null;
  public scopes: PermissionScope[] | null = null;

  public wallet: BeaconWallet;

  constructor() {}

  async requestPermission() {
    console.log("connecting");
    try {
      Tezos.setProvider({ rpc: `https://tezos-node.prod.gke.papers.tech` });

      this.wallet = new BeaconWallet({ name: "Foundry" });
      Tezos.setWalletProvider(this.wallet);

      const network = {
        type: NetworkType.MAINNET,
      };

      // requesting permissions
      await this.wallet.requestPermissions({ network });
      Tezos.setWalletProvider(this.wallet);
      this.address = await this.wallet.getPKH();
    } catch (error) {
      console.log(error);
    }
  }

  getAddress(): Observable<string> {
    return of(this.address);
  }
}
