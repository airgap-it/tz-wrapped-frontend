import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromRoot from "../../app.reducer";
import * as actions from "../../app.actions";
import { Observable } from "rxjs";
import { FormControl } from "@angular/forms";
import { BeaconService } from "../../services/beacon/beacon.service";
// import { BeaconService } from "src/app/services/beacon/beacon.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @Input() buttonLabel: string | undefined;

  receivingAddressControl: FormControl;
  amountControl: FormControl;
  // receivingAddress$: Observable<string>;
  dataEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  public address$: Observable<string> | null = null;

  constructor(
    private readonly store$: Store<fromRoot.State>, // private readonly beaconService: BeaconService
    private readonly beaconService: BeaconService
  ) {
    // localStorage.clear();
    this.receivingAddressControl = new FormControl("");
    this.amountControl = new FormControl(null);
    this.beaconService.setupBeaconWallet().then(() => {
      this.address$ = this.store$.select((state) => state.app.address);
    });
  }

  ngOnInit(): void {}

  connectWallet() {
    this.store$.dispatch(actions.connectWallet());
    this.address$ = this.store$.select((state) => state.app.address);
  }

  mint() {
    console.log("minting");
  }

  burn() {
    console.log("burn");
  }

  transfer() {
    console.log("transfer");

    const receivingAddressCondition =
      this.receivingAddressControl.value &&
      this.receivingAddressControl.value.length === 36 &&
      this.receivingAddressControl.value.startsWith("tz1");

    const amountCondition =
      this.amountControl.value && Number(this.amountControl.value);

    if (amountCondition && receivingAddressCondition) {
      this.store$.dispatch(
        actions.transferOperation({
          transferAmount: Number(this.amountControl.value),
          receivingAddress: this.receivingAddressControl.value,
        })
      );
      // this.beaconService.transferOperation(
      //   Number(this.amountControl.value),
      //   this.receivingAddressControl.value
      // );
    } else {
      console.log("invalid inputs");
    }
  }
}
