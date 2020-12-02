import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromRoot from "../../app.reducer";
import * as actions from "../../app.actions";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  constructor(private readonly store$: Store<fromRoot.State>) {}

  ngOnInit(): void {}

  connectWallet() {
    this.store$.dispatch(actions.connectWallet());
    this.store$.select((state) => state.app.address);
  }
}
