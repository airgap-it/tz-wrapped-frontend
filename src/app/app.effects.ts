import { TezosOperationType } from '@airgap/beacon-sdk'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'

import * as actions from './app.actions'
import { ApiService, OperationKind } from './services/api/api.service'
import { BeaconService } from './services/beacon/beacon.service'

@Injectable()
export class AppEffects {
  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() => {
        console.log('ACTION')
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
        console.log('success')
        return actions.loadAddress()
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

  loadMintingRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMintingRequests),
      switchMap(({ contractId }) => {
        return this.apiService
          .getOperations(contractId, OperationKind.MINT)
          .pipe(
            map((response) =>
              actions.loadMintingRequestsSucceeded({ response })
            ),
            catchError((error) =>
              of(actions.loadMintingRequestsFailed({ error }))
            )
          )
      })
    )
  )

  loadApprovals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovals),
      switchMap(({ requestId }) => {
        return this.apiService.getApprovals(requestId).pipe(
          map((response) => actions.loadApprovalsSucceeded({ response })),
          catchError((error) => of(actions.loadApprovalsFailed({ error })))
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

  requestMintOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestMintOperation),
      switchMap(({ contractId, receivingAddress, mintAmount }) => {
        return this.apiService
          .mint(contractId, receivingAddress, mintAmount)
          .toPromise()
          .then((response) =>
            actions.requestMintOperationSucceeded({ response })
          )
          .catch((error) => actions.requestMintOperationFailed({ error }))
      })
    )
  )

  mintOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestMintOperationSucceeded),
      map(({ response }) => {
        console.log('got minting request, now singing', response)
        return actions.signMintOperationRequest({ response })
      })
    )
  )

  signMintOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signMintOperationRequest),
      switchMap(({ response }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.signMintOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
            })
          )
          .catch((error) => actions.signMintOperationRequestFailed({ error }))
      })
    )
  )

  signMintOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signMintOperationRequestSucceeded),
      map(({ response, signature }) => {
        console.log('got minting request, now singing', response)
        return actions.submitSignedMintingRequest({
          request: { ...response.operation_request, gk_signature: signature },
        })
      })
    )
  )

  submitSignedMintingRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedMintingRequest),
      switchMap(({ request }) => {
        console.log('SENDING SIGNED REQUEST')
        return this.apiService
          .addSignature(request)
          .toPromise()
          .then((signResponse) => actions.submitSignedMintingRequestSucceeded())
          .catch((error) => actions.submitSignedMintingRequestFailed({ error }))
      })
    )
  )

  requestApproveMintOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestApproveMintOperation),
      switchMap(({ requestId }) => {
        return this.apiService
          .getSignableMessage(requestId)
          .toPromise()
          .then((response) =>
            actions.requestApproveMintOperationSucceeded({ response })
          )
          .catch((error) =>
            actions.requestApproveMintOperationFailed({ error })
          )
      })
    )
  )

  requestApproveMintOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestApproveMintOperationSucceeded),
      map(({ response }) => {
        console.log('got minting approval request, now singing', response)
        return actions.signApproveMintOperationRequest({ response })
      })
    )
  )

  signApproveMintOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signApproveMintOperationRequest),
      switchMap(({ response }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.signApproveMintOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
            })
          )
          .catch((error) =>
            actions.signApproveMintOperationRequestFailed({ error })
          )
      })
    )
  )

  signApproveMintOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signApproveMintOperationRequestSucceeded),
      map(({ response, signature }) => {
        console.log('got minting request, now singing', response)
        return actions.submitSignedApproveMintOperationRequest({
          request: response,
          approval: { ...response.operation_approval, kh_signature: signature },
        })
      })
    )
  )

  submitSignedApproveMintOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedApproveMintOperationRequest),
      switchMap(({ request, approval }) => {
        return this.apiService
          .addApproval(approval)
          .toPromise()
          .then((response) =>
            actions.submitSignedApproveMintOperationRequestSucceeded({
              request,
              approval,
            })
          )
          .catch((error) =>
            actions.submitSignedApproveMintOperationRequestFailed({ error })
          )
      })
    )
  )

  submitSignedApproveMintOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedApproveMintOperationRequestSucceeded),
      map(({ request }) => {
        console.log('submit done, now refreshing approvals')
        return actions.loadApprovals({
          requestId: request.operation_approval.request,
        })
      })
    )
  )

  getApprovedMintParameters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getApprovedMintParameters),
      switchMap(({ operationId }) => {
        return this.apiService
          .getParameters(operationId)
          .toPromise()
          .then((response) =>
            actions.getApprovedMintParametersSucceeded({
              parameters: response,
            })
          )
          .catch((error) => actions.getApprovedMintParametersFailed({ error }))
      })
    )
  )

  getApprovedMintParametersSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getApprovedMintParametersSucceeded),
      map(({ parameters }) => {
        console.log('submit done, now refreshing approvals')
        return actions.signApprovedMint({
          operation: {
            operationDetails: [
              {
                kind: TezosOperationType.TRANSACTION,
                amount: '0',
                destination: 'KT1BYMvJoM75JyqFbsLKouqkAv8dgEvViioP',
                parameters,
              },
            ],
          },
        })
      })
    )
  )

  signApprovedMint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signApprovedMint),
      switchMap(({ operation }) => {
        return this.beaconService
          .operation(operation)
          .then((response) =>
            actions.signApprovedMintSucceeded({
              response,
            })
          )
          .catch((error) => actions.signApprovedMintFailed({ error }))
      })
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService,
    private readonly apiService: ApiService
  ) {}
}
