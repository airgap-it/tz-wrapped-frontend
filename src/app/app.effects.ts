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
  mergeMap,
  filter,
} from 'rxjs/operators'
import * as fromRoot from '../app/reducers/index'

import * as actions from './app.actions'
import { ApiService, OperationRequestKind } from './services/api/api.service'
import { BeaconService } from './services/beacon/beacon.service'

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}

  setupBeacon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setupBeacon),
      switchMap(() => {
        return this.beaconService
          .setupBeaconWallet()
          .then((accountInfo) => {
            if (accountInfo !== undefined) {
              return actions.connectWalletSucceeded({ accountInfo })
            } else {
              return actions.setupBeaconSucceeded()
            }
          })
          .catch((error) => actions.connectWalletFailed({ error }))
      })
    )
  )

  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() => {
        return this.beaconService
          .requestPermission()
          .then((accountInfo) =>
            actions.connectWalletSucceeded({ accountInfo })
          )
          .catch((error) => actions.connectWalletFailed({ error }))
      })
    )
  )

  connectWalletSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWalletSucceeded),
      map(() => actions.loadBalance())
    )
  )

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalance),
      withLatestFrom(
        this.store$.select((store) => store.app.activeAccount?.address),
        this.store$.select((store) => store.app.activeContract)
      ),
      filter(
        ([action, address, contract]) =>
          address !== undefined && contract !== undefined
      ),
      map(([action, address, contract]) => ({
        address: address!,
        contract: contract!,
      })),
      switchMap(({ address, contract }) => {
        return this.beaconService
          .getBalance(address, contract)
          .then((response) =>
            actions.loadBalanceSucceeded({ balance: response })
          )
          .catch((error) => actions.loadBalanceFailed(error))
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
      mergeMap(({ operationRequestId: requestId }) => {
        return this.apiService.getOperationApprovals(requestId).pipe(
          map((response) =>
            actions.loadOperationApprovalsSucceeded({
              operationRequestId: requestId,
              response,
            })
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
      withLatestFrom(this.store$.select((store) => store.app.activeContract)),
      filter(
        ([{ receivingAddress, transferAmount }, contract]) =>
          contract !== undefined
      ),
      map(([{ receivingAddress, transferAmount }, contract]) => ({
        receivingAddress,
        transferAmount,
        contract: contract!,
      })),
      switchMap(({ receivingAddress, transferAmount, contract }) => {
        return this.beaconService
          .transferOperation(transferAmount, receivingAddress, contract)
          .then((response) => actions.transferOperationSucceeded())
          .catch((error) => actions.transferOperationFailed({ error }))
      })
    )
  )

  transferOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.transferOperationSucceeded),
      map(() => actions.loadBalance())
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
          .sign(response.signable_message_info.message)
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

  getSignableMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableMessage),
      mergeMap(({ operationRequestId }) => {
        return this.apiService
          .getSignableMessage(operationRequestId)
          .toPromise()
          .then((signableMessage) =>
            actions.getSignableMessageSucceeded({
              signableMessage,
              operationRequestId,
            })
          )
          .catch((error) => actions.getSignableMessageFailed({ error }))
      })
    )
  )

  approveOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequest),
      switchMap(({ signableMessage, operationRequest }) => {
        return this.beaconService
          .sign(signableMessage.message)
          .then((signResponse) =>
            actions.approveOperationRequestSucceeded({
              operationRequest,
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
      map(({ operationRequest, signature }) => {
        return actions.submitOperationApproval({ operationRequest, signature })
      })
    )
  )

  submitOperationApproval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApproval),
      switchMap(({ operationRequest, signature }) => {
        return this.apiService
          .addOperationApproval({
            operation_request_id: operationRequest.id,
            signature,
          })
          .toPromise()
          .then((operationApproval) =>
            actions.submitOperationApprovalSucceeded({
              operationApproval,
              operationRequest,
            })
          )
          .catch((error) => actions.submitOperationApprovalFailed({ error }))
      })
    )
  )

  submitOperationApprovalSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApprovalSucceeded),
      map(({ operationApproval, operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.MINT) {
          return actions.loadMintOperationRequests({
            contractId: operationRequest.contract_id,
          })
        } else {
          return actions.loadBurnOperationRequests({
            contractId: operationRequest.contract_id,
          })
        }
      })
    )
  )

  getOperationRequestParameters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParameters),
      switchMap(({ operationRequest }) => {
        return this.apiService
          .getParameters(operationRequest.id)
          .toPromise()
          .then((response) =>
            actions.getOperationRequestParametersSucceeded({
              operationRequest,
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
      map(([{ operationRequest, parameters }, contract]) => {
        return actions.submitOperation({
          operationRequest,
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
      switchMap(({ operationRequest: operationRequestId, operation }) => {
        return this.beaconService
          .operation(operation)
          .then((response) =>
            actions.submitOperationSucceeded({
              operationRequest: operationRequestId,
              response,
            })
          )
          .catch((error) => actions.submitOperationFailed({ error }))
      })
    )
  )

  submitOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationSucceeded),
      map(({ operationRequest: operationRequestId, response }) =>
        actions.updateOperationWithHash({
          operationRequest: operationRequestId,
          response,
        })
      )
    )
  )

  updateOperationWithHash$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationWithHash),
      switchMap(({ operationRequest, response }) => {
        return this.apiService
          .updateOperationRequest(operationRequest.id, response.transactionHash)
          .toPromise()
          .then(() =>
            actions.updateOperationWithHashSucceeded({ operationRequest })
          )
          .catch((error) => actions.updateOperationWithHashFailed({ error }))
      })
    )
  )

  updateOperationWithHashSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationWithHashSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.MINT) {
          return actions.loadMintOperationRequests({
            contractId: operationRequest.contract_id,
          })
        } else {
          return actions.loadBurnOperationRequests({
            contractId: operationRequest.contract_id,
          })
        }
      })
    )
  )

  setActiveContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContract),
      switchMap(({ contract }) => [
        actions.setActiveContractSucceeded(),
        actions.loadContractNonce({ contractId: contract.id }),
      ])
    )
  )

  setActiveContractSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContractSucceeded),
      switchMap(() => [actions.loadBalance()])
    )
  )

  loadContractNonce$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractNonce),
      mergeMap(({ contractId }) => {
        return this.apiService
          .getContractNonce(contractId)
          .toPromise()
          .then((response) =>
            actions.loadContractNonceSucceeded({
              contractId,
              nonce: response,
            })
          )
          .catch((error) => actions.loadContractNonceFailed({ error }))
      })
    )
  )
}
