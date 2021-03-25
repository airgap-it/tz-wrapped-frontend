import { Component, OnDestroy, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import {
  getActiveAccount,
  getActiveContract,
  getApprovedUpdateKeyholdersOperationRequests,
  getBusyUpdateKeyholdersOperationRequests,
  getCanSignIn,
  getGatekeepers,
  getInjectedUpdateKeyholdersOperationRequests,
  getKeyholders,
  getKeyholdersToAdd,
  getKeyholdersToRemove,
  getNewThreshold,
  getOpenUpdateKeyholdersOperationRequests,
  getSessionUser,
  isGatekeeper,
  isKeyholder,
} from 'src/app/app.selectors'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { combineLatest, Observable, of, Subscription } from 'rxjs'
import { User } from 'src/app/services/api/interfaces/user'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { SessionUser } from 'src/app/services/api/interfaces/auth'
import {
  filter,
  map,
  pairwise,
  startWith,
  take,
  withLatestFrom,
} from 'rxjs/operators'
import { signIn } from 'src/app/common/auth'
import { loadContractsIfNeeded } from 'src/app/common/contracts'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { Router } from '@angular/router'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import {
  NewOperationRequest,
  OperationRequest,
  OperationRequestKind,
} from 'src/app/services/api/interfaces/operationRequest'
import { PagedResponse } from 'src/app/services/api/interfaces/common'
import { BeaconService } from 'src/app/services/beacon/beacon.service'
import { CopyService } from 'src/app/services/copy/copy-service.service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  public displayNameControl: FormControl
  public emailControl: FormControl
  public formGroup: FormGroup

  public get publicKeysControls(): FormArray {
    return this.formGroup.get('publicKeys') as FormArray
  }

  public get thresholdControl(): FormControl {
    return this.formGroup.get('threshold') as FormControl
  }

  public isGatekeeper$: Observable<boolean>
  public isKeyholder$: Observable<boolean>
  public gatekeepers$: Observable<User[]>
  public keyholders$: Observable<User[]>
  public activeContract$: Observable<Contract>
  public sessionUser$: Observable<SessionUser>
  public keyholdersCount$: Observable<number>
  public newThreshold$: Observable<number>
  public isUpdateContractEnabled$: Observable<boolean>
  public canUpdateKeyholders$: Observable<boolean>

  public openUpdateKeyholdersOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedUpdateKeyholdersOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedUpdateKeyholdersOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public busyUpdateKeyholdersOperationRequests$: Observable<boolean>

  private subscriptions: Subscription[] = []

  private keyholdersToRemove$: Observable<User[]>
  private keyholdersToAdd$: Observable<string[]>

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly router: Router,
    private readonly copyService: CopyService,
    formBuilder: FormBuilder
  ) {
    this.store$.dispatch(actions.setupBeacon())
    const canSignInSub = this.store$
      .select(getCanSignIn)
      .subscribe((canSignIn) => {
        if (canSignIn !== undefined && !canSignIn) {
          this.router.navigate(['/transfer'])
        }
      })
    this.subscriptions.push(canSignInSub)
    const signInSub = signIn(this.store$)
    this.subscriptions.push(signInSub)
    const contractsSub = loadContractsIfNeeded(store$)
    this.subscriptions.push(contractsSub)
    this.activeContract$ = this.store$
      .select(getActiveContract)
      .pipe(isNotNullOrUndefined())
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isKeyholder$ = this.store$.select(isKeyholder)
    this.canUpdateKeyholders$ = combineLatest([
      this.isKeyholder$,
      this.activeContract$,
    ]).pipe(
      map(
        ([isKeyholder, contract]) =>
          isKeyholder &&
          contract.capabilities.includes(OperationRequestKind.UPDATE_KEYHOLDERS)
      )
    )
    this.sessionUser$ = this.store$
      .select(getSessionUser)
      .pipe(isNotNullOrUndefined())
    this.gatekeepers$ = this.store$.select(getGatekeepers)
    this.keyholders$ = this.store$.select(getKeyholders)
    this.keyholdersToRemove$ = this.store$.select(getKeyholdersToRemove)
    this.keyholdersToAdd$ = this.store$.select(getKeyholdersToAdd)
    this.busyUpdateKeyholdersOperationRequests$ = this.store$.select(
      getBusyUpdateKeyholdersOperationRequests
    )
    this.keyholdersCount$ = combineLatest([
      this.keyholders$,
      this.keyholdersToAdd$,
      this.keyholdersToRemove$,
    ]).pipe(
      map(
        ([keyholders, toAdd, toRemove]) =>
          keyholders.length + toAdd.length - toRemove.length
      )
    )
    this.newThreshold$ = this.store$
      .select(getNewThreshold)
      .pipe(isNotNullOrUndefined())
    this.isUpdateContractEnabled$ = combineLatest([
      this.activeContract$,
      this.newThreshold$,
      this.keyholdersToRemove$,
      this.keyholdersToAdd$,
    ]).pipe(
      map(([contract, newThreshold, toRemove, toAdd]) => {
        return (
          toRemove.length > 0 ||
          toAdd.length > 0 ||
          contract.min_approvals !== newThreshold
        )
      })
    )

    this.openUpdateKeyholdersOperationRequests$ = this.store$.select(
      getOpenUpdateKeyholdersOperationRequests
    )
    this.approvedUpdateKeyholdersOperationRequests$ = this.store$.select(
      getApprovedUpdateKeyholdersOperationRequests
    )
    this.injectedUpdateKeyholdersOperationRequests$ = this.store$.select(
      getInjectedUpdateKeyholdersOperationRequests
    )

    const usersSub = combineLatest([
      this.store$.select(getActiveContract),
      this.store$.select(getSessionUser),
    ])
      .pipe(
        filter(
          ([contract, sessionUser]) =>
            contract !== undefined && sessionUser !== undefined
        ),
        map(([contract]) => ({ contract: contract! }))
      )
      .subscribe(({ contract }) => {
        this.store$.dispatch(actions.loadUsers({ contractId: contract.id }))
        this.store$.dispatch(actions.loadUpdateKeyholdersOperationRequests())
      })
    this.subscriptions.push(usersSub)
    this.displayNameControl = new FormControl('')
    this.emailControl = new FormControl('', [Validators.email])
    this.formGroup = formBuilder.group({
      threshold: new FormControl(null, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
      ]),
      publicKeys: formBuilder.array([this.createPublicKeyControl()]),
    })

    const sessionUserSub = this.sessionUser$.subscribe((sessionUser) => {
      this.displayNameControl.setValue(sessionUser.display_name)
      this.emailControl.setValue(sessionUser.email)
    })
    this.subscriptions.push(sessionUserSub)
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.thresholdControl.setValue(contract.min_approvals)
      this.store$.dispatch(
        actions.updateThreshold({ threshold: contract.min_approvals })
      )
    })
    const keyholdersCountSub = combineLatest([this.keyholdersCount$]).subscribe(
      ([keyholdersCount]) => {
        this.thresholdControl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(keyholdersCount),
          Validators.pattern('^\\d+$'),
        ])
        this.thresholdControl.updateValueAndValidity()
      }
    )
    this.subscriptions.push(keyholdersCountSub)

    const thresholdSub = this.thresholdControl.valueChanges.subscribe(
      (value) => {
        if (!this.thresholdControl.invalid) {
          this.store$.dispatch(
            actions.updateThreshold({ threshold: Number(value) })
          )
        }
      }
    )
    this.subscriptions.push(thresholdSub)
  }

  ngOnInit(): void {}

  private static edpkRegEx = /^edpk[\d|a-zA-Z]{50}/
  private createPublicKeyControl(): FormControl {
    const publicKeyControl = new FormControl(null, [
      Validators.pattern(SettingsComponent.edpkRegEx),
    ])

    const sub = publicKeyControl.statusChanges
      .pipe(
        withLatestFrom(
          publicKeyControl.valueChanges.pipe(startWith(''), pairwise())
        ),
        filter(
          ([, [prev, next]]) =>
            SettingsComponent.edpkRegEx.test(next) ||
            SettingsComponent.edpkRegEx.test(prev)
        )
      )
      .subscribe(([status, [prev, next]]) => {
        if (status === 'VALID') {
          if (next !== '') {
            combineLatest([this.keyholders$, this.keyholdersToAdd$])
              .pipe(
                take(1),
                map(([keyholders, keyholdersToAdd]) => ({
                  keyholders: keyholders.map((kh) => kh.public_key),
                  keyholdersToAdd,
                }))
              )
              .subscribe(({ keyholders, keyholdersToAdd }) => {
                if (
                  !keyholdersToAdd.includes(next) &&
                  !keyholders.includes(next)
                ) {
                  this.store$.dispatch(
                    actions.updateKeyholdersToAdd({ keyholder: next })
                  )
                }
              })
          } else if (prev !== '') {
            this.store$.dispatch(
              actions.updateKeyholdersToAdd({ keyholder: prev })
            )
          }
        } else if (status === 'INVALID' && prev !== '') {
          this.store$.dispatch(
            actions.updateKeyholdersToAdd({ keyholder: prev })
          )
        }
      })
    this.subscriptions.push(sub)
    return publicKeyControl
  }

  public addPulicKeyControl() {
    this.publicKeysControls.push(this.createPublicKeyControl())
  }

  public removePublicKeyControl(idx: number) {
    if (idx < this.publicKeysControls.controls.length) {
      const control = this.publicKeysControls.controls[idx] as FormControl
      if (!control.invalid && control.value && control.value.length > 0) {
        this.store$.dispatch(
          actions.updateKeyholdersToAdd({ keyholder: control.value })
        )
      }
      this.publicKeysControls.removeAt(idx)
    }
  }

  public updateSessionUser() {
    const displayName: string = this.displayNameControl.value
    const email: string = this.emailControl.value
    this.store$.dispatch(
      actions.updateSessionUser({
        displayName,
        email: email?.length > 0 ? email : null,
      })
    )
  }

  public updateContract() {
    combineLatest([
      this.activeContract$,
      this.keyholders$,
      this.keyholdersToRemove$,
      this.keyholdersToAdd$,
      this.newThreshold$,
    ])
      .pipe(take(1))
      .subscribe(([contract, keyholders, toRemove, toAdd, threshold]) => {
        const proposedKeyholders = keyholders
          .filter((kh) => !toRemove.includes(kh))
          .map((kh) => kh.public_key)
          .concat(toAdd)
        const newOperationRequest: NewOperationRequest = {
          kind: OperationRequestKind.UPDATE_KEYHOLDERS,
          contract_id: contract.id,
          target_address: null,
          amount: null,
          threshold,
          proposed_keyholders: proposedKeyholders.sort(),
        }
        this.store$.dispatch(
          actions.submitOperationRequest({ newOperationRequest })
        )
      })
    this.reset()
  }

  public toggleKeyholder(keyholder: User) {
    this.store$.dispatch(actions.updateKeyholdersToRemove({ keyholder }))
  }

  public isToggledOn(keyholder: User): Observable<boolean> {
    return this.keyholdersToRemove$.pipe(
      map((keyholdersToRemove) => !keyholdersToRemove.includes(keyholder))
    )
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  private reset() {
    this.store$.dispatch(actions.resetKeyholdersToRemove())
    this.store$.dispatch(actions.resetKeyholdersToAdd())
    this.publicKeysControls.controls = [this.createPublicKeyControl()]
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.updateThreshold({ threshold: contract.min_approvals })
      )
      this.thresholdControl.setValue(contract.min_approvals)
    })
  }

  public ngOnDestroy(): void {
    this.reset()
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }
}
