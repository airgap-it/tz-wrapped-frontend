import { TezosOperationType } from '@airgap/beacon-sdk'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { of } from 'rxjs'
import {
  map,
  catchError,
  switchMap,
  withLatestFrom,
  exhaustMap,
  mergeMap,
  filter,
} from 'rxjs/operators'
import * as fromRoot from '../app/reducers/index'

import * as actions from './app.actions'
import {
  ApiService,
  Contract,
  OperationRequestKind,
} from './services/api/api.service'
import { BeaconService } from './services/beacon/beacon.service'

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}

  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() => {
        return this.beaconService
          .requestPermission()
          .then((response) => actions.connectWalletSucceeded())
          .catch((error) => actions.connectWalletFailed({ error }))
      })
    )
  )

  connectWalletSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWalletSucceeded),
      map(() => {
        return actions.loadAddress(), actions.loadBalance()
      })
    )
  )

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalance),
      switchMap(() => {
        return this.beaconService
          .getBalance()
          .then((response) =>
            actions.loadBalanceSucceeded({ balance: response })
          )
          .catch((error) => actions.loadBalanceFailed(error))
      })
    )
  )

  loadAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAddress),
      switchMap(() => {
        return this.beaconService.getAddress().pipe(
          map((address) => actions.loadAddressSucceeded({ address })),
          catchError((error) => of(actions.loadAddressFailed({ error })))
        )
      })
    )
  )
  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContracts),
      switchMap(() => {
        return this.apiService.getContracts().pipe(
          map((response) => actions.loadContractsSucceeded({ response })),
          catchError((error) => of(actions.loadContractsFailed({ error })))
        )
      })
    )
  )

  loadContractsSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractsSucceeded),
      map(({ response }) => {
        const contract = response.results[0]
        return actions.setActiveContract({ contract })
      })
    )
  )

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUsers),
      switchMap(({ contractId }) => {
        return this.apiService.getUsers(contractId).pipe(
          map((response) => actions.loadUsersSucceeded({ response })),
          catchError((error) => of(actions.loadUsersFailed({ error })))
        )
      })
    )
  )

  disconnectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.disconnectWallet),
      switchMap(() => {
        return this.beaconService
          .reset()
          .then((response) => actions.disconnectWalletSucceeded())
          .catch((error) => actions.disconnectWalletFailed({ error }))
      })
    )
  )

  loadMintOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMintOperationRequests),
      switchMap(({ contractId }) => {
        return this.apiService
          .getOperationRequests(contractId, OperationRequestKind.MINT)
          .pipe(
            map((response) =>
              actions.loadMintOperationRequestsSucceeded({ response })
            ),
            catchError((error) =>
              of(actions.loadMintOperationRequestsFailed({ error }))
            )
          )
      })
    )
  )

  loadBurnOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBurnOperationRequests),
      switchMap(({ contractId }) => {
        return this.apiService
          .getOperationRequests(contractId, OperationRequestKind.BURN)
          .pipe(
            map((response) =>
              actions.loadBurnOperationRequestsSucceeded({ response })
            ),
            catchError((error) =>
              of(actions.loadBurnOperationRequestsFailed({ error }))
            )
          )
      })
    )
  )

  loadOperationApprovals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationApprovals),
      mergeMap(({ requestId }) => {
        return this.apiService.getOperationApprovals(requestId).pipe(
          map((response) =>
            actions.loadOperationApprovalsSucceeded({ requestId, response })
          ),
          catchError((error) =>
            of(actions.loadOperationApprovalsFailed({ error }))
          )
        )
      })
    )
  )

  transferOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.transferOperation),
      switchMap(({ receivingAddress, transferAmount }) => {
        return this.beaconService
          .transferOperation(transferAmount, receivingAddress)
          .then((response) => actions.transferOperationSucceeded())
          .catch((error) => actions.transferOperationFailed({ error }))
      })
    )
  )

  getSignableOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableOperationRequest),
      switchMap(({ contractId, kind, amount, targetAddress }) => {
        return this.apiService
          .getSignableOperationRequest(contractId, kind, amount, targetAddress)
          .pipe(
            map((response) => {
              return actions.getSignableOperationRequestSucceeded({
                response,
                contractId,
              })
            }),
            catchError((error) =>
              of(actions.getSignableOperationRequestFailed({ error }))
            )
          )
      })
    )
  )

  getSignableOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableOperationRequestSucceeded),
      map(({ response, contractId }) => {
        return actions.signOperationRequest({ response, contractId })
      })
    )
  )

  signOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOperationRequest),
      switchMap(({ response, contractId }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.signOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
              contractId,
            })
          )
          .catch((error) => actions.signOperationRequestFailed({ error }))
      })
    )
  )

  signOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOperationRequestSucceeded),
      map(({ response, signature, contractId }) => {
        return actions.submitSignedOperationRequest({
          request: {
            ...response.unsigned_operation_request,
            signature: signature,
          },
          contractId,
        })
      })
    )
  )

  submitSignedOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedOperationRequest),
      switchMap(({ request, contractId }) => {
        {
          return this.apiService
            .addOperationRequest(request)
            .toPromise()
            .then((response) => {
              return actions.submitSignedOperationRequestSucceeded({ response })
            })
            .catch((error) =>
              actions.submitSignedOperationRequestFailed({ error })
            )
        }
      })
    )
  )

  getApprovableOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getApprovableOperationRequest),
      switchMap(({ requestId }) => {
        return this.apiService
          .getApprovableOperationRequest(requestId)
          .toPromise()
          .then((response) =>
            actions.getApprovableOperationRequestSucceeded({ response })
          )
          .catch((error) =>
            actions.getApprovableOperationRequestFailed({ error })
          )
      })
    )
  )

  getApprovableOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getApprovableOperationRequestSucceeded),
      map(({ response }) => {
        return actions.approveOperationRequest({ response })
      })
    )
  )

  approveOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequest),
      switchMap(({ response }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.approveOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
            })
          )
          .catch((error) => actions.approveOperationRequestFailed({ error }))
      })
    )
  )

  approveOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequestSucceeded),
      map(({ response, signature }) => {
        return actions.submitOperationApproval({
          request: response,
          approval: {
            ...response.unsigned_operation_approval,
            signature: signature,
          },
        })
      })
    )
  )

  submitOperationApproval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApproval),
      switchMap(({ request, approval }) => {
        return this.apiService
          .addOperationApproval(approval)
          .toPromise()
          .then((response) =>
            actions.submitOperationApprovalSucceeded({
              response,
            })
          )
          .catch((error) => actions.submitOperationApprovalFailed({ error }))
      })
    )
  )

  // submitOperationApprovalSucceeded$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(actions.submitOperationApprovalSucceeded),
  //     map(({ request }) => {
  //       return actions.loadOperationApprovals({
  //         requestId: request.unsigned_operation_approval.operation_request_id,
  //       })
  //     })
  //   )
  // )

  getOperationRequestParameters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParameters),
      switchMap(({ operationId }) => {
        return this.apiService
          .getParameters(operationId)
          .toPromise()
          .then((response) =>
            actions.getOperationRequestParametersSucceeded({
              parameters: response,
            })
          )
          .catch((error) =>
            actions.getOperationRequestParametersFailed({ error })
          )
      })
    )
  )

  getOperationRequestParametersSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParametersSucceeded),
      withLatestFrom(this.store$.select((state) => state.app.activeContract)),
      filter((value) => value[1] !== undefined),
      map(([{ parameters }, contract]) => {
        return actions.submitOperation({
          operation: {
            operationDetails: [
              {
                kind: TezosOperationType.TRANSACTION,
                amount: '0',
                destination: contract!.multisig_pkh,
                parameters,
              },
            ],
          },
        })
      })
    )
  )

  submitOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperation),
      switchMap(({ operation }) => {
        return this.beaconService
          .operation(operation)
          .then((response) =>
            actions.submitOperationSucceeded({
              response,
            })
          )
          .catch((error) => actions.submitOperationFailed({ error }))
      })
    )
  )

  setActiveContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContract),
      map(({ contract }) => {
        const asset = contract.display_name
        return actions.changeAsset({ asset })
      })
    )
  )
}
