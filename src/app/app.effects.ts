import { TezosOperationType } from '@airgap/beacon-sdk'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import * as fromRoot from '../app/reducers/index'

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

  loadBurningRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBurningRequests),
      switchMap(({ contractId }) => {
        return this.apiService
          .getOperations(contractId, OperationKind.BURN)
          .pipe(
            map((response) =>
              actions.loadBurningRequestsSucceeded({ response })
            ),
            catchError((error) =>
              of(actions.loadBurningRequestsFailed({ error }))
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
          map((response) =>
            actions.loadApprovalsSucceeded({ requestId, response })
          ),
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

  requestBurnOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestBurnOperation),

      withLatestFrom(this.store$.select((state) => state.app.address)),
      switchMap(([{ contractId, burnAmount }, address]) => {
        return this.apiService.burn(contractId, address, burnAmount).pipe(
          map((response) => {
            console.log('burn response: ', response)
            return actions.requestBurnOperationSucceeded({
              response,
              contractId,
            })
          }),
          catchError((error) =>
            of(actions.requestBurnOperationFailed({ error }))
          )
        )
      })
    )
  )

  burnOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestBurnOperationSucceeded),
      map(({ response, contractId }) => {
        console.log('got burn request, now singing', response)
        return actions.signBurnOperationRequest({ response, contractId })
      })
    )
  )

  signBurnOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signBurnOperationRequest),
      switchMap(({ response, contractId }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.signBurnOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
              contractId,
            })
          )
          .catch((error) => actions.signBurnOperationRequestFailed({ error }))
      })
    )
  )

  signBurnOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signBurnOperationRequestSucceeded),
      map(({ response, signature, contractId }) => {
        console.log('got Burning request, now singing', response)
        return actions.submitSignedBurningRequest({
          request: { ...response.operation_request, gk_signature: signature },
          contractId,
        })
      })
    )
  )

  submitSignedBurningRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedBurningRequest),
      switchMap(({ request, contractId }) => {
        console.log('SENDING SIGNED REQUEST:', request)
        {
          return this.apiService
            .addSignature(request)
            .toPromise()
            .then((signResponse) => {
              return (
                actions.submitSignedBurningRequestSucceeded(),
                actions.loadBurningRequests({ contractId })
              )
            })
            .catch((error) =>
              actions.submitSignedBurningRequestFailed({ error })
            )
        }
      })
    )
  )

  requestApproveBurnOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestApproveBurnOperation),
      switchMap(({ requestId }) => {
        return this.apiService
          .getSignableMessage(requestId)
          .toPromise()
          .then((response) =>
            actions.requestApproveBurnOperationSucceeded({ response })
          )
          .catch((error) =>
            actions.requestApproveBurnOperationFailed({ error })
          )
      })
    )
  )

  requestApproveBurnOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestApproveBurnOperationSucceeded),
      map(({ response }) => {
        console.log('got Burning approval request, now singing', response)
        return actions.signApproveBurnOperationRequest({ response })
      })
    )
  )

  signApproveBurnOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signApproveBurnOperationRequest),
      switchMap(({ response }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.signApproveBurnOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
            })
          )
          .catch((error) =>
            actions.signApproveBurnOperationRequestFailed({ error })
          )
      })
    )
  )

  signApproveBurnOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signApproveBurnOperationRequestSucceeded),
      map(({ response, signature }) => {
        console.log('got Burning request, now singing', response)
        return actions.submitSignedApproveBurnOperationRequest({
          request: response,
          approval: { ...response.operation_approval, kh_signature: signature },
        })
      })
    )
  )

  submitSignedApproveBurnOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedApproveBurnOperationRequest),
      switchMap(({ request, approval }) => {
        return this.apiService
          .addApproval(approval)
          .toPromise()
          .then((response) =>
            actions.submitSignedApproveBurnOperationRequestSucceeded({
              request,
              approval,
            })
          )
          .catch((error) =>
            actions.submitSignedApproveBurnOperationRequestFailed({ error })
          )
      })
    )
  )

  submitSignedApproveBurnOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedApproveBurnOperationRequestSucceeded),
      map(({ request }) => {
        console.log('submit done, now refreshing approvals')
        return actions.loadApprovals({
          requestId: request.operation_approval.request,
        })
      })
    )
  )

  getApprovedBurnParameters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getApprovedBurnParameters),
      switchMap(({ operationId }) => {
        return this.apiService
          .getParameters(operationId)
          .toPromise()
          .then((response) =>
            actions.getApprovedBurnParametersSucceeded({
              parameters: response,
            })
          )
          .catch((error) => actions.getApprovedBurnParametersFailed({ error }))
      })
    )
  )

  getApprovedBurnParametersSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getApprovedBurnParametersSucceeded),
      map(({ parameters }) => {
        console.log('submit done, now refreshing approvals')
        return actions.signApprovedBurn({
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

  signApprovedBurn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signApprovedBurn),
      switchMap(({ operation }) => {
        return this.beaconService
          .operation(operation)
          .then((response) =>
            actions.signApprovedBurnSucceeded({
              response,
            })
          )
          .catch((error) => actions.signApprovedBurnFailed({ error }))
      })
    )
  )

  requestMintOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestMintOperation),
      switchMap(({ contractId, receivingAddress, mintAmount }) => {
        return this.apiService
          .mint(contractId, receivingAddress, mintAmount)
          .pipe(
            map((response) => {
              return actions.requestMintOperationSucceeded({
                response,
                contractId,
              })
            }),
            catchError((error) =>
              of(actions.requestMintOperationFailed({ error }))
            )
          )
      })
    )
  )

  mintOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.requestMintOperationSucceeded),
      map(({ response, contractId }) => {
        console.log('got minting request, now singing', response)
        return actions.signMintOperationRequest({ response, contractId })
      })
    )
  )

  signMintOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signMintOperationRequest),
      switchMap(({ response, contractId }) => {
        return this.beaconService
          .sign(response.signable_message)
          .then((signResponse) =>
            actions.signMintOperationRequestSucceeded({
              response,
              signature: signResponse.signature,
              contractId,
            })
          )
          .catch((error) => actions.signMintOperationRequestFailed({ error }))
      })
    )
  )

  signMintOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signMintOperationRequestSucceeded),
      map(({ response, signature, contractId }) => {
        console.log('got minting request, now singing', response)
        return actions.submitSignedMintingRequest({
          request: { ...response.operation_request, gk_signature: signature },
          contractId,
        })
      })
    )
  )

  submitSignedMintingRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitSignedMintingRequest),
      switchMap(({ request, contractId }) => {
        {
          return this.apiService
            .addSignature(request)
            .toPromise()
            .then((signResponse) => {
              return (
                actions.submitSignedMintingRequestSucceeded(),
                actions.loadMintingRequests({ contractId })
              )
            })
            .catch((error) =>
              actions.submitSignedMintingRequestFailed({ error })
            )
        }
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

  setActiveContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContract),
      map(({ contract }) => {
        const asset = contract.display_name
        return actions.changeAsset({ asset })
      })
    )
  )
  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
