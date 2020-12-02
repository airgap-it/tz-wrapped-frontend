import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";

import * as actions from "./app.actions";
import { BeaconService } from "./services/beacon/beacon.service";

@Injectable()
export class AppEffects {
  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() => {
        return this.beaconService
          .requestPermission()
          .then((response) => actions.connectWalletSucceeded())
          .catch((error) => actions.connectWalletFailed({ error }));
      })
    )
  );

  connectWalletSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWalletSucceeded),
      map(() => {
        return actions.loadAddress();
      })
    )
  );

  loadAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAddress),
      switchMap(() => {
        return this.beaconService.getAddress().pipe(
          map((address) => actions.loadAddressSucceeded({ address })),
          catchError((error) => of(actions.loadAddressFailed({ error })))
        );
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService
  ) {}
}
