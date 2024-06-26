import { SigningType, TezosOperationType } from '@airgap/beacon-sdk'
import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { from, Observable, of } from 'rxjs'
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
import {
  getActiveAccount,
  getActiveContract,
  getApprovedAcceptOwnershipOperationRequestCurrentPage,
  getApprovedAddOperatorOperationRequestCurrentPage,
  getApprovedBurnOperationRequestCurrentPage,
  getApprovedMintOperationRequestCurrentPage,
  getApprovedRemoveOperatorOperationRequestCurrentPage,
  getApprovedSetRedeemAddressOperationRequestCurrentPage,
  getApprovedTransferOwnershipOperationRequestCurrentPage,
  getApprovedUpdateKeyholdersOperationRequestCurrentPage,
  getCanSignIn,
  getInjectedAcceptOwnershipOperationRequestCurrentPage,
  getInjectedAddOperatorOperationRequestCurrentPage,
  getInjectedBurnOperationRequestCurrentPage,
  getInjectedMintOperationRequestCurrentPage,
  getInjectedRemoveOperatorOperationRequestCurrentPage,
  getInjectedSetRedeemAddressOperationRequestCurrentPage,
  getInjectedTransferOwnershipOperationRequestCurrentPage,
  getInjectedUpdateKeyholdersOperationRequestCurrentPage,
  getOpenAcceptOwnershipOperationRequestCurrentPage,
  getOpenAddOperatorOperationRequestCurrentPage,
  getOpenBurnOperationRequestCurrentPage,
  getOpenMintOperationRequestCurrentPage,
  getOpenRemoveOperatorOperationRequestCurrentPage,
  getOpenSetRedeemAddressOperationRequestCurrentPage,
  getOpenTransferOwnershipOperationRequestCurrentPage,
  getOpenUpdateKeyholdersOperationRequestCurrentPage,
  getRedeemAddress,
} from './app.selectors'
import { ApiService } from './services/api/api.service'
import { ErrorKind, isAPIError } from './services/api/interfaces/error'
import {
  OperationRequestKind,
  OperationRequestState,
} from './services/api/interfaces/operationRequest'
import { BeaconService } from './services/beacon/beacon.service'
import { CacheService } from './services/cache/cache.service'
import { Contract } from './services/api/interfaces/contract'
import { Router } from '@angular/router'

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>,
    private readonly cacheService: CacheService,
    private readonly router: Router
  ) {}

  setupBeacon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setupBeacon),
      switchMap(() =>
        from(this.beaconService.activeAccount()).pipe(
          map((accountInfo) => {
            if (accountInfo !== undefined) {
              return actions.connectWalletSucceeded({ accountInfo })
            } else {
              return actions.setupBeaconSucceeded()
            }
          }),
          catchError((error) => of(actions.connectWalletFailed({ error })))
        )
      )
    )
  )

  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() =>
        from(this.beaconService.requestPermission()).pipe(
          map((accountInfo) => actions.connectWalletSucceeded({ accountInfo })),
          catchError((error) => of(actions.connectWalletFailed({ error })))
        )
      )
    )
  )

  getSignInChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignInChallenge),
      withLatestFrom(this.store$.select(getCanSignIn)),
      filter(([, canSignIn]) => canSignIn !== false),
      map(([address]) => address),
      switchMap(({ address }) =>
        this.apiService.getSignInChallenge(address).pipe(
          map((challenge) =>
            actions.getSignInChallengeSucceeded({ challenge })
          ),
          catchError((errorResponse) =>
            of(actions.getSignInChallengeFailed({ errorResponse }))
          )
        )
      )
    )
  )

  getSignInChallengeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignInChallengeSucceeded),
      switchMap(({ challenge }) => {
        if (challenge !== null) {
          return [
            actions.updateCanSignIn({ canSignIn: true }),
            actions.signChallenge({ challenge }),
          ]
        } else {
          return of(actions.getSessionUser())
        }
      })
    )
  )

  getSignInChallengeFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignInChallengeFailed),
      map(({ errorResponse }) => {
        const error = errorResponse.error
        if (isAPIError(error)) {
          if (error.error === ErrorKind.Forbidden) {
            // the address we received from Beacon SDK cannot ever login (not a gatekeepr or keyholder)
            return actions.updateCanSignIn({ canSignIn: false })
          }
          return actions.showAlert({
            alertMessage: { status: error.code, message: error.message },
          })
        } else {
          return actions.showAlert({ alertMessage: errorResponse })
        }
      })
    )
  )

  signChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signChallenge),
      switchMap(({ challenge }) =>
        from(
          this.beaconService.sign(challenge.message, SigningType.OPERATION)
        ).pipe(
          map((signResponse) =>
            actions.signChallengeSucceeded({
              challengeResponse: {
                id: challenge.id,
                signature: signResponse.signature,
              },
            })
          ),
          catchError((error) => of(actions.signChallengeFailed({ error })))
        )
      )
    )
  )

  signChallengeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signChallengeSucceeded),
      map(({ challengeResponse }) =>
        actions.respondToSignInChallenge({ challengeResponse })
      )
    )
  )

  respondToSignInChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.respondToSignInChallenge),
      switchMap(({ challengeResponse }) =>
        this.apiService.respondToSignInChallenge(challengeResponse).pipe(
          map((sessionUser) =>
            actions.respondToSignInChallengeSucceeded({ sessionUser })
          ),
          catchError((errorResponse) =>
            of(actions.respondToSignInChallengeFailed({ errorResponse }))
          )
        )
      )
    )
  )

  respondToSignInChallengeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.respondToSignInChallengeSucceeded),
      map(({ sessionUser }) => actions.getSessionUserSucceeded({ sessionUser }))
    )
  )

  respondToSignInChallengeFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.respondToSignInChallengeFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  getSessionUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSessionUser),
      switchMap(() =>
        this.apiService.getSessionUser().pipe(
          map((sessionUser) =>
            actions.getSessionUserSucceeded({ sessionUser })
          ),
          catchError((errorResponse) =>
            of(actions.getSessionUserFailed({ errorResponse }))
          )
        )
      )
    )
  )

  updateSessionUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateSessionUser),
      switchMap(({ displayName, email }) =>
        this.apiService.updateSessionUser(displayName, email).pipe(
          map((sessionUser) =>
            actions.updateSessionUserSucceeded({ sessionUser })
          ),
          catchError((errorResponse) =>
            of(actions.updateSessionUserFailed({ errorResponse }))
          )
        )
      )
    )
  )

  updateSessionUserFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateSessionUserFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  signOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOut),
      switchMap(() =>
        this.apiService.signOut().pipe(
          map(() => actions.signOutSucceeded()),
          catchError((errorResponse) =>
            of(actions.signOutFailed({ errorResponse }))
          )
        )
      )
    )
  )

  signOutSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOutSucceeded),
      map(() => {
        if (this.router.url === '/settings') {
          this.router.navigate(['/transfer'])
        }
        return actions.noOp()
      })
    )
  )

  signOutFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOutFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  handleHttpErrorResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.handleHttpErrorResponse),
      withLatestFrom(this.store$.select(getActiveAccount)),
      switchMap(([{ errorResponse }, activeAccount]) => {
        const error = errorResponse.error
        console.error(error)
        if (isAPIError(error)) {
          if (
            error.error === ErrorKind.Unauthorized &&
            activeAccount !== undefined
          ) {
            return of(actions.handleUnauthenticatedError())
          } else if (error.error === ErrorKind.Forbidden) {
            return of(actions.noOp())
          } else {
            return of(
              actions.showAlert({
                alertMessage: { status: error.code, message: error.message },
              })
            )
          }
        } else {
          return of(actions.showAlert({ alertMessage: errorResponse }))
        }
      })
    )
  )

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalance),
      withLatestFrom(
        this.store$.select(getActiveAccount),
        this.store$.select(getActiveContract)
      ),
      filter(
        ([account, contract]) => account !== undefined && contract !== undefined
      ),
      map(([, account, contract]) => ({
        address: account!.address,
        contract: contract!,
      })),
      switchMap(({ address, contract }) =>
        from(this.beaconService.getBalance(address, contract)).pipe(
          map((response) =>
            actions.loadBalanceSucceeded({ balance: response })
          ),
          catchError((error) => of(actions.loadBalanceFailed(error)))
        )
      )
    )
  )

  loadTezosNodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTezosNodes),
      switchMap(() => this.apiService.getTezosNodes()),
      map((response) => actions.loadTezosNodesSucceeded({ response })),
      catchError((errorResponse: HttpErrorResponse) =>
        of(actions.loadTezosNodesFailed({ errorResponse }))
      )
    )
  )

  loadTezosNodesFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTezosNodesFailed),
      switchMap((value) => of(actions.handleHttpErrorResponse(value)))
    )
  )

  selectTezosNode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.selectTezosNode),
      switchMap(({ tezosNode }) =>
        from(this.apiService.selectTezosNode(tezosNode))
      ),
      map((response) => actions.selectTezosNodeSucceeded({ response })),
      catchError((errorResponse: HttpErrorResponse) =>
        of(actions.selectTezosNodeFailed({ errorResponse }))
      )
    )
  )

  selectTezosNodeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.selectTezosNodeSucceeded),
      map(() => actions.loadTezosNodes())
    )
  )

  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContracts),
      switchMap(() =>
        this.apiService.getContracts().pipe(
          map((response) => actions.loadContractsSucceeded({ response })),
          catchError((error) => of(actions.loadContractsFailed({ error })))
        )
      )
    )
  )

  loadContractsSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractsSucceeded),
      switchMap(({ response }) => {
        const contracts: Contract[] = response.results

        const cachedContract$ = this.cacheService.get(
          'activeContract'
        ) as Observable<Contract>

        if (cachedContract$) {
          return cachedContract$.pipe(
            map((cachedContract) => {
              if (cachedContract === undefined) {
                return actions.setActiveContract({
                  contract: response.results[0],
                })
              }
              const activeContract = contracts.find(
                (contract) => contract.id === cachedContract.id
              )
              return actions.setActiveContract({
                contract:
                  activeContract !== undefined
                    ? activeContract
                    : response.results[0],
              })
            })
          )
        } else {
          return of(
            actions.setActiveContract({ contract: response.results[0] })
          )
        }
      })
    )
  )

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUsers),
      switchMap(({ contractId }) =>
        this.apiService.getUsers(contractId).pipe(
          map((response) => actions.loadUsersSucceeded({ response })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(actions.loadUsersFailed({ errorResponse }))
          )
        )
      )
    )
  )

  loadUsersFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUsersFailed),
      switchMap((value) => of(actions.handleHttpErrorResponse(value)))
    )
  )

  disconnectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.disconnectWallet),
      switchMap(() =>
        from(this.beaconService.reset()).pipe(
          map(() => actions.disconnectWalletSucceeded()),
          catchError((error) => of(actions.disconnectWalletFailed({ error })))
        )
      )
    )
  )

  disconnectWalletSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.disconnectWalletSucceeded),
      map(() => actions.signOut())
    )
  )

  loadOperationRequestPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationRequestPage),
      withLatestFrom(this.store$.select(getActiveContract)),
      filter(([, contract]) => contract !== undefined),
      map(([{ kind, state, page }, contract]) => ({
        kind,
        state,
        page,
        contract: contract!,
      })),
      map(({ kind, state, page, contract }) => {
        const params = {
          contractId: contract.id,
          page,
        }
        if (kind === OperationRequestKind.MINT) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenMintOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedMintOperationRequests(params)
          } else {
            return actions.loadInjectedMintOperationRequests(params)
          }
        } else if (kind === OperationRequestKind.BURN) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenBurnOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedBurnOperationRequests(params)
          } else {
            return actions.loadInjectedBurnOperationRequests(params)
          }
        } else if (kind === OperationRequestKind.ADD_OPERATOR) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenAddOperatorOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedAddOperatorOperationRequests(params)
          } else {
            return actions.loadInjectedAddOperatorOperationRequests(params)
          }
        } else if (kind === OperationRequestKind.REMOVE_OPERATOR) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenRemoveOperatorOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedRemoveOperatorOperationRequests(params)
          } else {
            return actions.loadInjectedRemoveOperatorOperationRequests(params)
          }
        } else if (kind === OperationRequestKind.SET_REDEEM_ADDRESS) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenSetRedeemAddressOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedSetRedeemAddressOperationRequests(params)
          } else {
            return actions.loadInjectedSetRedeemAddressOperationRequests(params)
          }
        } else if (kind === OperationRequestKind.TRANSFER_OWNERSHIP) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenTransferOwnershipOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedTransferOwnershipOperationRequests(
              params
            )
          } else {
            return actions.loadInjectedTransferOwnershipOperationRequests(
              params
            )
          }
        } else if (kind === OperationRequestKind.ACCEPT_OWNERSHIP) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenAcceptOwnershipOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedAcceptOwnershipOperationRequests(params)
          } else {
            return actions.loadInjectedAcceptOwnershipOperationRequests(params)
          }
        } else {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenUpdateKeyholdersOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedUpdateKeyholdersOperationRequests(params)
          } else {
            return actions.loadInjectedUpdateKeyholdersOperationRequests(params)
          }
        }
      })
    )
  )

  /// Mint

  loadMintOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMintOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenMintOperationRequests({}),
          actions.loadApprovedMintOperationRequests({}),
          actions.loadInjectedMintOperationRequests({}),
        ])
      )
    )
  )

  loadOpenMintOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenMintOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenMintOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.MINT,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenMintOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenMintOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadMintOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadApprovedMintOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedMintOperationRequests),
      withLatestFrom(
        this.store$.select(getApprovedMintOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.MINT,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedMintOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedMintOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadMintOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadInjectedMintOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedMintOperationRequests),
      withLatestFrom(
        this.store$.select(getInjectedMintOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.MINT,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedMintOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedMintOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadMintOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadMintOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMintOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  /// Burn

  loadBurnOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBurnOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenBurnOperationRequests({}),
          actions.loadApprovedBurnOperationRequests({}),
          actions.loadInjectedBurnOperationRequests({}),
        ])
      )
    )
  )

  loadOpenBurnOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenBurnOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenBurnOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.BURN,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenBurnOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenBurnOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadBurnOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadApprovedBurnOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedBurnOperationRequests),
      withLatestFrom(
        this.store$.select(getApprovedBurnOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.BURN,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedBurnOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedBurnOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadBurnOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadInjectedBurnOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedBurnOperationRequests),
      withLatestFrom(
        this.store$.select(getInjectedBurnOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.BURN,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedBurnOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedBurnOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadBurnOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadBurnOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBurnOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  /// Add Operator

  loadAddOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAddOperatorOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenAddOperatorOperationRequests({}),
          actions.loadApprovedAddOperatorOperationRequests({}),
          actions.loadInjectedAddOperatorOperationRequests({}),
        ])
      )
    )
  )

  loadOpenAddOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenAddOperatorOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenAddOperatorOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.ADD_OPERATOR,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenAddOperatorOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenAddOperatorOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadAddOperatorOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedAddOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedAddOperatorOperationRequests),
      withLatestFrom(
        this.store$.select(getApprovedAddOperatorOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.ADD_OPERATOR,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedAddOperatorOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedAddOperatorOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadAddOperatorOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedAddOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedAddOperatorOperationRequests),
      withLatestFrom(
        this.store$.select(getInjectedAddOperatorOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.ADD_OPERATOR,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedAddOperatorOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedAddOperatorOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadAddOperatorOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadAddOperatorOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAddOperatorOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  /// Remove Operator

  loadRemoveOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRemoveOperatorOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenRemoveOperatorOperationRequests({}),
          actions.loadApprovedRemoveOperatorOperationRequests({}),
          actions.loadInjectedRemoveOperatorOperationRequests({}),
        ])
      )
    )
  )

  loadOpenRemoveOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenRemoveOperatorOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenRemoveOperatorOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.REMOVE_OPERATOR,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenRemoveOperatorOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenRemoveOperatorOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadRemoveOperatorOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedRemoveOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedRemoveOperatorOperationRequests),
      withLatestFrom(
        this.store$.select(
          getApprovedRemoveOperatorOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.REMOVE_OPERATOR,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedRemoveOperatorOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedRemoveOperatorOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadRemoveOperatorOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedRemoveOperatorOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedRemoveOperatorOperationRequests),
      withLatestFrom(
        this.store$.select(
          getInjectedRemoveOperatorOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.REMOVE_OPERATOR,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedRemoveOperatorOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedRemoveOperatorOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadRemoveOperatorOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadRemoveOperatorOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRemoveOperatorOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  /// Set Redeem Address

  loadSetRedeemAddressOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadSetRedeemAddressOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenSetRedeemAddressOperationRequests({}),
          actions.loadApprovedSetRedeemAddressOperationRequests({}),
          actions.loadInjectedSetRedeemAddressOperationRequests({}),
        ])
      )
    )
  )

  loadOpenSetRedeemAddressOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenSetRedeemAddressOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenSetRedeemAddressOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.SET_REDEEM_ADDRESS,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenSetRedeemAddressOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenSetRedeemAddressOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadSetRedeemAddressOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedSetRedeemAddressOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedSetRedeemAddressOperationRequests),
      withLatestFrom(
        this.store$.select(
          getApprovedSetRedeemAddressOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.SET_REDEEM_ADDRESS,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedSetRedeemAddressOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedSetRedeemAddressOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadSetRedeemAddressOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedSetRedeemAddressOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedSetRedeemAddressOperationRequests),
      withLatestFrom(
        this.store$.select(
          getInjectedSetRedeemAddressOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.SET_REDEEM_ADDRESS,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedSetRedeemAddressOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedSetRedeemAddressOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadSetRedeemAddressOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadSetRedeemAddressOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadSetRedeemAddressOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  /// Transfer Ownership

  loadTransferOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransferOwnershipOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenTransferOwnershipOperationRequests({}),
          actions.loadApprovedTransferOwnershipOperationRequests({}),
          actions.loadInjectedTransferOwnershipOperationRequests({}),
        ])
      )
    )
  )

  loadOpenTransferOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenTransferOwnershipOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenTransferOwnershipOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.TRANSFER_OWNERSHIP,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenTransferOwnershipOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenTransferOwnershipOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadTransferOwnershipOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedTransferOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedTransferOwnershipOperationRequests),
      withLatestFrom(
        this.store$.select(
          getApprovedTransferOwnershipOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.TRANSFER_OWNERSHIP,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedTransferOwnershipOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedTransferOwnershipOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadTransferOwnershipOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedTransferOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedTransferOwnershipOperationRequests),
      withLatestFrom(
        this.store$.select(
          getInjectedTransferOwnershipOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.TRANSFER_OWNERSHIP,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedTransferOwnershipOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedTransferOwnershipOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadTransferOwnershipOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadTransferOwnershipOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransferOwnershipOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  /// Accept Ownership

  loadAcceptOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAcceptOwnershipOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenAcceptOwnershipOperationRequests({}),
          actions.loadApprovedAcceptOwnershipOperationRequests({}),
          actions.loadInjectedAcceptOwnershipOperationRequests({}),
        ])
      )
    )
  )

  loadOpenAcceptOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenAcceptOwnershipOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenAcceptOwnershipOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.ACCEPT_OWNERSHIP,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenAcceptOwnershipOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenAcceptOwnershipOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadAcceptOwnershipOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedAcceptOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedAcceptOwnershipOperationRequests),
      withLatestFrom(
        this.store$.select(
          getApprovedAcceptOwnershipOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.ACCEPT_OWNERSHIP,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedAcceptOwnershipOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedAcceptOwnershipOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadAcceptOwnershipOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedAcceptOwnershipOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedAcceptOwnershipOperationRequests),
      withLatestFrom(
        this.store$.select(
          getInjectedAcceptOwnershipOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.ACCEPT_OWNERSHIP,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedAcceptOwnershipOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedAcceptOwnershipOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadAcceptOwnershipOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadAcceptOwnershipOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAcceptOwnershipOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  ///

  loadUpdateKeyholdersOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUpdateKeyholdersOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenUpdateKeyholdersOperationRequests({}),
          actions.loadApprovedUpdateKeyholdersOperationRequests({}),
          actions.loadInjectedUpdateKeyholdersOperationRequests({}),
        ])
      )
    )
  )

  loadOpenUpdateKeyholdersOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenUpdateKeyholdersOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenUpdateKeyholdersOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.UPDATE_KEYHOLDERS,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenUpdateKeyholdersOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenUpdateKeyholdersOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadUpdateKeyholdersOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedUpdateKeyholdersOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedUpdateKeyholdersOperationRequests),
      withLatestFrom(
        this.store$.select(
          getApprovedUpdateKeyholdersOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.UPDATE_KEYHOLDERS,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedUpdateKeyholdersOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedUpdateKeyholdersOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadUpdateKeyholdersOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedUpdateKeyholdersOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedUpdateKeyholdersOperationRequests),
      withLatestFrom(
        this.store$.select(
          getInjectedUpdateKeyholdersOperationRequestCurrentPage
        ),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.UPDATE_KEYHOLDERS,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedUpdateKeyholdersOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedUpdateKeyholdersOperationRequestsSucceeded(
                {
                  response,
                }
              )
            }),
            catchError((errorResponse) =>
              of(
                actions.loadUpdateKeyholdersOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadUpdateKeyholdersOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUpdateKeyholdersOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  transferOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.transferOperation),
      withLatestFrom(this.store$.select(getActiveContract)),
      filter(([, contract]) => contract !== undefined),
      map(([{ receivingAddress, transferAmount }, contract]) => ({
        receivingAddress,
        transferAmount,
        contract: contract!,
      })),
      switchMap(({ receivingAddress, transferAmount, contract }) =>
        from(
          this.beaconService.transferOperation(
            transferAmount,
            receivingAddress,
            contract
          )
        ).pipe(
          map(() => actions.transferOperationSucceeded()),
          catchError((error) => of(actions.transferOperationFailed({ error })))
        )
      )
    )
  )

  submitOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationRequest),
      switchMap(({ newOperationRequest }) =>
        this.apiService.addOperationRequest(newOperationRequest).pipe(
          map((operationRequest) =>
            actions.submitOperationRequestSucceeded({ operationRequest })
          ),
          catchError((errorResponse) =>
            of(
              actions.submitOperationRequestFailed({
                errorResponse,
                newOperationRequest,
              })
            )
          )
        )
      )
    )
  )

  submitOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationRequestSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.MINT) {
          return actions.loadOpenMintOperationRequests({})
        } else if (operationRequest.kind === OperationRequestKind.BURN) {
          return actions.loadOpenBurnOperationRequests({})
        } else if (
          operationRequest.kind === OperationRequestKind.ADD_OPERATOR
        ) {
          return actions.loadOpenAddOperatorOperationRequests({})
        } else if (
          operationRequest.kind === OperationRequestKind.REMOVE_OPERATOR
        ) {
          return actions.loadOpenRemoveOperatorOperationRequests({})
        } else if (
          operationRequest.kind === OperationRequestKind.SET_REDEEM_ADDRESS
        ) {
          return actions.loadOpenSetRedeemAddressOperationRequests({})
        } else if (
          operationRequest.kind === OperationRequestKind.TRANSFER_OWNERSHIP
        ) {
          return actions.loadOpenTransferOwnershipOperationRequests({})
        } else if (
          operationRequest.kind === OperationRequestKind.ACCEPT_OWNERSHIP
        ) {
          return actions.loadOpenAcceptOwnershipOperationRequests({})
        } else {
          return actions.loadOpenUpdateKeyholdersOperationRequests({})
        }
      })
    )
  )

  submitSignedOperationRequestFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationRequestFailed),
      map(({ errorResponse }) =>
        actions.handleHttpErrorResponse({ errorResponse })
      )
    )
  )

  getSignableMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableMessage),
      mergeMap(({ operationRequestId }) =>
        this.apiService.getSignableMessage(operationRequestId).pipe(
          map((signableMessage) => {
            return actions.getSignableMessageSucceeded({
              signableMessage,
              operationRequestId,
            })
          }),
          catchError((errorResponse) =>
            of(actions.getSignableMessageFailed({ errorResponse }))
          )
        )
      )
    )
  )

  getSignableMessageFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableMessageFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  approveOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequest),
      switchMap(({ signableMessage, operationRequest }) =>
        from(this.beaconService.sign(signableMessage.message)).pipe(
          map((signResponse) =>
            actions.approveOperationRequestSucceeded({
              operationRequest,
              signature: signResponse.signature,
            })
          ),
          catchError((error) =>
            of(actions.approveOperationRequestFailed({ error }))
          )
        )
      )
    )
  )

  approveOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequestSucceeded),
      map(({ operationRequest, signature }) =>
        actions.submitOperationApproval({ operationRequest, signature })
      )
    )
  )

  submitOperationApproval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApproval),
      switchMap(({ operationRequest, signature }) =>
        this.apiService
          .addOperationApproval({
            operation_request_id: operationRequest.id,
            signature,
          })
          .pipe(
            map((operationApproval) =>
              actions.submitOperationApprovalSucceeded({
                operationApproval,
                operationRequest,
              })
            ),
            catchError((errorResponse) =>
              of(actions.submitOperationApprovalFailed({ errorResponse }))
            )
          )
      )
    )
  )

  submitOperationApprovalSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApprovalSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.MINT) {
          return actions.loadMintOperationRequests()
        } else if (operationRequest.kind === OperationRequestKind.BURN) {
          return actions.loadBurnOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.ADD_OPERATOR
        ) {
          return actions.loadAddOperatorOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.REMOVE_OPERATOR
        ) {
          return actions.loadRemoveOperatorOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.SET_REDEEM_ADDRESS
        ) {
          return actions.loadSetRedeemAddressOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.TRANSFER_OWNERSHIP
        ) {
          return actions.loadTransferOwnershipOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.ACCEPT_OWNERSHIP
        ) {
          return actions.loadAcceptOwnershipOperationRequests()
        } else {
          return actions.loadUpdateKeyholdersOperationRequests()
        }
      })
    )
  )

  submitOperationApprovalFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApprovalFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  getOperationRequestParameters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParameters),
      switchMap(({ operationRequest }) =>
        this.apiService.getParameters(operationRequest.id).pipe(
          map((parameters) =>
            actions.getOperationRequestParametersSucceeded({
              operationRequest,
              parameters,
            })
          ),
          catchError((errorResponse) =>
            of(actions.getOperationRequestParametersFailed({ errorResponse }))
          )
        )
      )
    )
  )

  getOperationRequestParametersSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParametersSucceeded),
      withLatestFrom(this.store$.select(getActiveContract)),
      filter(([, contract]) => contract !== undefined),
      map(([{ operationRequest, parameters }, contract]) =>
        actions.submitOperation({
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
      )
    )
  )

  getOperationRequestParametersFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParametersFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  submitOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperation),
      switchMap(({ operationRequest, operation }) =>
        from(this.beaconService.operation(operation)).pipe(
          map((operationResponse) =>
            actions.submitOperationSucceeded({
              operationRequest,
              operationResponse,
            })
          ),
          catchError((error) => of(actions.submitOperationFailed({ error })))
        )
      )
    )
  )

  submitOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationSucceeded),
      map(({ operationRequest, operationResponse }) =>
        actions.updateOperationRequestStateToInjected({
          operationRequest,
          injectedOperationHash: operationResponse.transactionHash,
        })
      )
    )
  )

  updateOperationRequestStateToInjected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationRequestStateToInjected),
      switchMap(({ operationRequest, injectedOperationHash }) =>
        this.apiService
          .updateOperationRequest(operationRequest.id, injectedOperationHash)
          .pipe(
            map(() =>
              actions.updateOperationRequestStateToInjectedSucceeded({
                operationRequest,
              })
            ),
            catchError((errorResponse) =>
              of(
                actions.updateOperationRequestStateToInjectedFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  updateOperationRequestStateToInjectedSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationRequestStateToInjectedSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.MINT) {
          return actions.loadMintOperationRequests()
        } else if (operationRequest.kind === OperationRequestKind.BURN) {
          return actions.loadBurnOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.ADD_OPERATOR
        ) {
          return actions.loadAddOperatorOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.REMOVE_OPERATOR
        ) {
          return actions.loadRemoveOperatorOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.SET_REDEEM_ADDRESS
        ) {
          return actions.loadSetRedeemAddressOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.TRANSFER_OWNERSHIP
        ) {
          return actions.loadTransferOwnershipOperationRequests()
        } else if (
          operationRequest.kind === OperationRequestKind.ACCEPT_OWNERSHIP
        ) {
          return actions.loadAcceptOwnershipOperationRequests()
        } else {
          return actions.loadUpdateKeyholdersOperationRequests()
        }
      })
    )
  )

  updateOperationRequestStateToInjectedFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationRequestStateToInjectedFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  setActiveContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContract),

      switchMap(({ contract }) =>
        this.cacheService.set('activeContract', contract).pipe(
          map(() => actions.setActiveContractSucceeded({ contract })),
          catchError((errorResponse) =>
            of(actions.setActiveContractFailed({ errorResponse }))
          )
        )
      )
    )
  )

  setActiveContractSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContractSucceeded),
      map(({ contract }) =>
        actions.loadContractNonce({ contractId: contract.id })
      )
    )
  )

  loadContractNonce$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractNonce),
      mergeMap(({ contractId }) =>
        this.apiService.getContractNonce(contractId).pipe(
          map((nonce) =>
            actions.loadContractNonceSucceeded({ contractId, nonce })
          ),
          catchError((errorResponse) =>
            of(actions.loadContractNonceFailed({ errorResponse }))
          )
        )
      )
    )
  )

  loadContractNonceFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractNonceFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  deleteOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteOperationRequest),
      switchMap(({ operationRequest }) =>
        this.apiService.deleteOperationRequest(operationRequest.id).pipe(
          map(() =>
            actions.deleteOperationRequestSucceeded({ operationRequest })
          ),
          catchError((errorResponse) =>
            of(actions.deleteOperationRequestFailed({ errorResponse }))
          )
        )
      )
    )
  )

  deleteOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteOperationRequestSucceeded),
      switchMap(() => [
        actions.loadMintOperationRequests(),
        actions.loadBurnOperationRequests(),
        actions.loadAddOperatorOperationRequests(),
        actions.loadRemoveOperatorOperationRequests(),
        actions.loadSetRedeemAddressOperationRequests(),
        actions.loadUpdateKeyholdersOperationRequests(),
        actions.loadTransferOwnershipOperationRequests(),
        actions.loadAcceptOwnershipOperationRequests(),
      ])
    )
  )

  deleteOperationRequestFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteOperationRequestFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  loadRedeemAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRedeemAddress),
      switchMap(({ contract }) =>
        from(this.beaconService.getRedeemAddress(contract)).pipe(
          map((address) => actions.loadRedeemAddressSucceeded({ address })),
          catchError((error) => of(actions.loadRedeemAddressFailed({ error })))
        )
      )
    )
  )

  loadRedeemAddressSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRedeemAddressSucceeded),
      map(() => actions.loadRedeemAddressBalance())
    )
  )

  loadRedeemAddressBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRedeemAddressBalance),
      withLatestFrom(
        this.store$.select(getActiveContract),
        this.store$.select(getRedeemAddress)
      ),
      filter(
        ([, contract, redeemAddress]) =>
          contract !== undefined && redeemAddress !== undefined
      ),
      map(([, contract, redeemAddress]) => ({
        contract: contract!,
        redeemAddress: redeemAddress!,
      })),
      switchMap(({ contract, redeemAddress }) =>
        from(this.beaconService.getBalance(redeemAddress, contract)).pipe(
          map((balance) =>
            actions.loadRedeemAddressBalanceSucceeded({ balance })
          ),
          catchError((error) =>
            of(actions.loadRedeemAddressBalanceFailed({ error }))
          )
        )
      )
    )
  )
}
