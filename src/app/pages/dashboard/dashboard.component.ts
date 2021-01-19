import { Component, EventEmitter, Input, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { FormControl, Validators } from '@angular/forms'
import {
  Contract,
  OperationRequest,
  User,
  OperationRequestKind,
  OperationRequestState,
  UserKind,
} from 'src/app/services/api/api.service'
import { combineLatest, Observable } from 'rxjs'
import BigNumber from 'bignumber.js'
import {
  convertBalanceToUIString,
  convertUIStringToBalance,
} from 'src/app/utils/amount'
import { filter, first, map, switchMap, take } from 'rxjs/operators'
import { ActivatedRoute } from '@angular/router'

export enum Tab {
  TRANSFER = 'tab-transfer',
  MINT = 'tab-mint',
  BURN = 'tab-burn',
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() buttonLabel: string | undefined

  public selectedTab$: Observable<Tab> = new Observable<Tab>()

  receivingAddressControl: FormControl
  amountTransferControl: FormControl
  amountControl: FormControl
  dataEmitter: EventEmitter<any[]> = new EventEmitter<any[]>()
  public address$: Observable<string | null>
  public openMintOperationRequests$: Observable<OperationRequest[]>
  public approvedMintOperationRequests$: Observable<OperationRequest[]>
  public injectedMintOperationRequests$: Observable<OperationRequest[]>
  public openBurnRequests$: Observable<OperationRequest[]>
  public approvedBurnRequests$: Observable<OperationRequest[]>
  public injectedBurnRequests$: Observable<OperationRequest[]>
  public users$: Observable<User[]>
  public keyholders$: Observable<User[]>
  public mintOperationRequests$: Observable<OperationRequest[]>
  public burnOperationRequests$: Observable<OperationRequest[]>
  public isGatekeeper$: Observable<boolean>
  public isKeyholder$: Observable<boolean>
  public balance$: Observable<BigNumber | undefined>
  public activeContract$: Observable<Contract>
  public activeContractId$: Observable<string>

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly route: ActivatedRoute
  ) {
    this.selectedTab$ = this.store$.select((state) => state.app.selectedTab)
    this.store$.dispatch(actions.setupBeacon())
    this.store$.dispatch(actions.loadContracts())

    this.receivingAddressControl = new FormControl('', [
      Validators.required,
      Validators.minLength(36),
      Validators.maxLength(36),
      Validators.pattern('^tz1[\\d|a-zA-Z]{33}'),
    ])

    this.amountControl = new FormControl(null, [
      Validators.min(0),
      Validators.required,
      Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
    ])

    this.mintOperationRequests$ = this.store$.select(
      (state) => state.app.mintOperationRequests
    )
    this.burnOperationRequests$ = this.store$.select(
      (state) => state.app.burnOperationRequests
    )

    this.openMintOperationRequests$ = this.store$.select((state) =>
      state.app.mintOperationRequests.filter(
        (operationRequest) =>
          operationRequest.state === OperationRequestState.OPEN
      )
    )

    this.approvedMintOperationRequests$ = this.store$.select((state) =>
      state.app.mintOperationRequests.filter(
        (operationRequest) =>
          operationRequest.state === OperationRequestState.APPROVED
      )
    )

    this.injectedMintOperationRequests$ = this.store$.select((state) =>
      state.app.mintOperationRequests.filter(
        (operationRequest) =>
          operationRequest.state === OperationRequestState.INJECTED
      )
    )

    this.openBurnRequests$ = this.store$.select((state) =>
      state.app.burnOperationRequests.filter(
        (operationRequest) =>
          operationRequest.state === OperationRequestState.OPEN
      )
    )

    this.approvedBurnRequests$ = this.store$.select((state) =>
      state.app.burnOperationRequests.filter(
        (operationRequest) =>
          operationRequest.state === OperationRequestState.APPROVED
      )
    )

    this.injectedBurnRequests$ = this.store$.select((state) =>
      state.app.burnOperationRequests.filter(
        (operationRequest) =>
          operationRequest.state === OperationRequestState.INJECTED
      )
    )

    this.users$ = this.store$.select((state) => state.app.users)
    this.keyholders$ = this.store$.select((state) =>
      state.app.users.filter((user) => user.kind === UserKind.KEYHOLDER)
    )
    this.address$ = this.store$.select(
      (state) => state.app.activeAccount?.address ?? ''
    )
    this.isGatekeeper$ = this.address$.pipe(
      switchMap((address) => {
        return this.store$.select((state) =>
          state.app.users.some(
            (user) =>
              user.kind === UserKind.GATEKEEPER && user.address === address
          )
        )
      })
    )
    this.isKeyholder$ = this.address$.pipe(
      switchMap((address) => {
        return this.store$.select((state) =>
          state.app.users.some(
            (user) =>
              user.kind === UserKind.KEYHOLDER && user.address === address
          )
        )
      })
    )

    this.balance$ = this.store$.select((state) => state.app.balance)

    this.amountTransferControl = new FormControl(null, [
      Validators.min(0),
      Validators.required,
      Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
    ])

    this.activeContract$ = this.store$
      .select((state) => state.app.activeContract)
      .pipe(
        filter((value) => value !== undefined),
        map((value) => value!)
      )
    this.activeContractId$ = this.store$
      .select((state) => state.app.activeContract?.id)
      .pipe(
        filter((value) => value !== undefined),
        map((value) => value!)
      )
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.tab === 'mint') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.MINT }))
      } else if (params?.tab === 'burn') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.BURN }))
      } else {
        this.store$.dispatch(actions.selectTab({ tab: Tab.TRANSFER }))
      }
    })

    this.balance$.subscribe((balance) => {
      this.amountTransferControl.setValidators([
        Validators.min(0),
        Validators.max(balance?.toNumber() ?? 0),
        Validators.required,
        Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
      ])
    })

    this.store$.dispatch(actions.loadContracts())
    this.activeContractId$.subscribe((contractId) => {
      if (contractId) {
        this.store$.dispatch(actions.loadUsers({ contractId: contractId }))
        this.store$.dispatch(
          actions.loadMintOperationRequests({
            contractId: contractId,
          })
        )
        this.store$.dispatch(
          actions.loadBurnOperationRequests({
            contractId: contractId,
          })
        )
      }
    })

    this.store$.dispatch(actions.loadBalance())
  }

  connectWallet() {
    this.store$.dispatch(actions.connectWallet())
  }

  mint() {
    this.getSignableOperationRequest(OperationRequestKind.MINT)
  }

  burn() {
    this.getSignableOperationRequest(OperationRequestKind.BURN)
  }

  private getSignableOperationRequest(kind: OperationRequestKind) {
    let targetAddress: string | undefined = undefined
    if (kind === OperationRequestKind.MINT) {
      if (
        this.receivingAddressControl.value &&
        this.receivingAddressControl.value.length === 36 &&
        this.receivingAddressControl.value.startsWith('tz1')
      ) {
        targetAddress = this.receivingAddressControl.value
      } else {
        throw new Error(
          `Address invalid: ${this.receivingAddressControl.value}`
        )
      }
    }

    const amountCondition =
      this.amountControl.value && Number(this.amountControl.value)
    if (!amountCondition) {
      throw new Error(`Amount invalid: ${this.amountControl.value}`)
    }

    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.getSignableOperationRequest({
          contractId: contract.id,
          kind,
          amount: convertUIStringToBalance(
            this.amountControl.value,
            contract.decimals
          ).toFixed(),
          targetAddress,
        })
      )
    })
  }

  transfer() {
    const receivingAddressCondition =
      this.receivingAddressControl.value &&
      this.receivingAddressControl.value.length === 36 &&
      this.receivingAddressControl.value.startsWith('tz1')

    if (this.amountTransferControl.value && receivingAddressCondition) {
      this.activeContract$.pipe(take(1)).subscribe((contract) => {
        this.store$.dispatch(
          actions.transferOperation({
            transferAmount: convertUIStringToBalance(
              this.amountTransferControl.value,
              contract.decimals
            ),
            receivingAddress: this.receivingAddressControl.value,
          })
        )
      })
    } else {
      console.error('invalid inputs')
    }
  }

  onSelect(event: any): void {
    this.store$.dispatch(actions.selectTab({ tab: event.id }))
  }

  setMaxValue(): void {
    combineLatest([
      this.balance$,
      this.store$.select((state) => state.app.activeContract),
    ])
      .pipe(first())
      .subscribe(async ([balance, contract]) => {
        if (balance && contract) {
          this.amountTransferControl.setValue(
            convertBalanceToUIString(balance, contract.decimals).toString(10)
          )
        }
      })
  }
}
