import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { combineLatest, Observable, Subscription } from 'rxjs'
import BigNumber from 'bignumber.js'
import {
  convertBigNumberToAmount,
  convertAmountToBigNumber,
  amountValidator,
} from 'src/app/utils/amount'
import { filter, map, take } from 'rxjs/operators'
import { ActivatedRoute, Router } from '@angular/router'
import {
  OperationRequest,
  OperationRequestKind,
} from 'src/app/services/api/interfaces/operationRequest'
import { User } from 'src/app/services/api/interfaces/user'
import { Contract } from 'src/app/services/api/interfaces/contract'
import {
  getActiveAccount,
  getActiveContract,
  getAddress,
  getApprovedBurnOperationRequests,
  getApprovedMintOperationRequests,
  getBalance,
  getBusyBurnOperationRequests,
  getInjectedBurnOperationRequests,
  getInjectedMintOperationRequests,
  getKeyholders,
  getBusyMintOperationRequests,
  getOpenBurnOperationRequests,
  getOpenMintOperationRequests,
  getRedeemAddress,
  getRedeemAddressBalance,
  getSelectedTab,
  getSessionUser,
  getUsers,
  isGatekeeper,
  isKeyholder,
  getGatekeepers,
  getBusyAddOperatorOperationRequests,
  getBusyRemoveOperatorOperationRequests,
  getBusySetRedeenAddressOperationRequests,
  getOpenAddOperatorOperationRequests,
  getApprovedAddOperatorOperationRequests,
  getInjectedAddOperatorOperationRequests,
  getOpenRemoveOperatorOperationRequests,
  getApprovedRemoveOperatorOperationRequests,
  getInjectedRemoveOperatorOperationRequests,
  getOpenSetRedeemAddressOperationRequests,
  getApprovedSetRedeemAddressOperationRequests,
  getInjectedSetRedeemAddressOperationRequests,
  getOpenTransferOwnershipOperationRequests,
  getApprovedTransferOwnershipOperationRequests,
  getInjectedTransferOwnershipOperationRequests,
  getOpenAcceptOwnershipOperationRequests,
  getApprovedAcceptOwnershipOperationRequests,
  getInjectedAcceptOwnershipOperationRequests,
  getBusyTransferOwnershipOperationRequests,
  getBusyAcceptOwnershipOperationRequests,
} from 'src/app/app.selectors'
import { Tab } from './tab'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { validateAddress } from 'src/app/utils/address'
import { PagedResponse } from 'src/app/services/api/interfaces/common'
import { signIn } from 'src/app/common/auth'
import { loadContractsIfNeeded } from 'src/app/common/contracts'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() buttonLabel: string | undefined

  public selectedTab$: Observable<Tab> = new Observable<Tab>()

  public receivingAddressControl: FormControl
  public amountTransferControl: FormControl
  public amountBurnControl: FormControl
  public amountControl: FormControl
  public ledgerHashControl: FormControl
  public address$: Observable<string | undefined>

  public openMintOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedMintOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedMintOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public openBurnOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedBurnOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedBurnOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public openAddOperatorOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedAddOperatorOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedAddOperatorOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public openRemoveOperatorOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedRemoveOperatorOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedRemoveOperatorOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public openSetRedeemAddressOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedSetRedeemAddressOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedSetRedeemAddressOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public openTransferOwnershipOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedTransferOwnershipOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedTransferOwnershipOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public openAcceptOwnershipOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedAcceptOwnershipOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedAcceptOwnershipOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public users$: Observable<User[]>
  public keyholders$: Observable<User[]>

  public isGatekeeper$: Observable<boolean>
  public isKeyholder$: Observable<boolean>
  public canMint$: Observable<boolean>
  public canBurn$: Observable<boolean>
  public canAddOperator$: Observable<boolean>
  public canRemoveOperator$: Observable<boolean>
  public canSetRedeemAddress$: Observable<boolean>
  public canTransferOwnership$: Observable<boolean>
  public canAcceptOwnership$: Observable<boolean>
  public balance$: Observable<BigNumber | undefined>
  public activeContract$: Observable<Contract>
  public activeContractImagePath$: Observable<string>

  public redeemAddress$: Observable<string | undefined>
  public redeemAddressBalance$: Observable<BigNumber | undefined>

  private subscriptions: Subscription[] = []

  public busyMintOperationRequests$: Observable<boolean>
  public busyBurnOperationRequests$: Observable<boolean>
  public busyAddOperatorOperationRequests$: Observable<boolean>
  public busyRemoveOperatorOperationRequests$: Observable<boolean>
  public busySetRedeemAddressOperationRequests$: Observable<boolean>
  public busyTransferOwnershipOperationRequests$: Observable<boolean>
  public busyAcceptOwnershipOperationRequests$: Observable<boolean>

  public gatekeepers$: Observable<User[]>
  public formGroup: FormGroup

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.store$.dispatch(actions.loadTezosNodes())
    this.activeContract$ = this.store$
      .select(getActiveContract)
      .pipe(isNotNullOrUndefined())
    this.activeContractImagePath$ = this.activeContract$.pipe(
      map((contract) => `assets/img/${contract.symbol.toLowerCase()}.svg`)
    )

    const signInSub = signIn(this.store$)
    this.subscriptions.push(signInSub)
    this.selectedTab$ = this.store$.select(getSelectedTab)

    this.store$.dispatch(actions.setupBeacon())
    const contractSub = loadContractsIfNeeded(store$)
    this.subscriptions.push(contractSub)

    this.openMintOperationRequests$ = this.store$.select(
      getOpenMintOperationRequests
    )
    this.approvedMintOperationRequests$ = this.store$.select(
      getApprovedMintOperationRequests
    )
    this.injectedMintOperationRequests$ = this.store$.select(
      getInjectedMintOperationRequests
    )

    this.openBurnOperationRequests$ = this.store$.select(
      getOpenBurnOperationRequests
    )
    this.approvedBurnOperationRequests$ = this.store$.select(
      getApprovedBurnOperationRequests
    )
    this.injectedBurnOperationRequests$ = this.store$.select(
      getInjectedBurnOperationRequests
    )

    this.openAddOperatorOperationRequests$ = this.store$.select(
      getOpenAddOperatorOperationRequests
    )
    this.approvedAddOperatorOperationRequests$ = this.store$.select(
      getApprovedAddOperatorOperationRequests
    )
    this.injectedAddOperatorOperationRequests$ = this.store$.select(
      getInjectedAddOperatorOperationRequests
    )

    this.openRemoveOperatorOperationRequests$ = this.store$.select(
      getOpenRemoveOperatorOperationRequests
    )
    this.approvedRemoveOperatorOperationRequests$ = this.store$.select(
      getApprovedRemoveOperatorOperationRequests
    )
    this.injectedRemoveOperatorOperationRequests$ = this.store$.select(
      getInjectedRemoveOperatorOperationRequests
    )

    this.openSetRedeemAddressOperationRequests$ = this.store$.select(
      getOpenSetRedeemAddressOperationRequests
    )
    this.approvedSetRedeemAddressOperationRequests$ = this.store$.select(
      getApprovedSetRedeemAddressOperationRequests
    )
    this.injectedSetRedeemAddressOperationRequests$ = this.store$.select(
      getInjectedSetRedeemAddressOperationRequests
    )

    this.openTransferOwnershipOperationRequests$ = this.store$.select(
      getOpenTransferOwnershipOperationRequests
    )
    this.approvedTransferOwnershipOperationRequests$ = this.store$.select(
      getApprovedTransferOwnershipOperationRequests
    )
    this.injectedTransferOwnershipOperationRequests$ = this.store$.select(
      getInjectedTransferOwnershipOperationRequests
    )

    this.openAcceptOwnershipOperationRequests$ = this.store$.select(
      getOpenAcceptOwnershipOperationRequests
    )
    this.approvedAcceptOwnershipOperationRequests$ = this.store$.select(
      getApprovedAcceptOwnershipOperationRequests
    )
    this.injectedAcceptOwnershipOperationRequests$ = this.store$.select(
      getInjectedAcceptOwnershipOperationRequests
    )

    this.users$ = this.store$.select(getUsers)
    this.keyholders$ = this.store$.select(getKeyholders)
    this.address$ = this.store$.select(getAddress)
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isKeyholder$ = this.store$.select(isKeyholder)
    this.canMint$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(OperationRequestKind.MINT)
      )
    )
    this.canBurn$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(OperationRequestKind.BURN)
      )
    )
    this.canAddOperator$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(OperationRequestKind.ADD_OPERATOR)
      )
    )
    this.canRemoveOperator$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(OperationRequestKind.REMOVE_OPERATOR)
      )
    )
    this.canSetRedeemAddress$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(
            OperationRequestKind.SET_REDEEM_ADDRESS
          )
      )
    )
    this.canTransferOwnership$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(
            OperationRequestKind.TRANSFER_OWNERSHIP
          )
      )
    )
    this.canAcceptOwnership$ = combineLatest([
      this.activeContract$,
      this.store$.select(getSessionUser),
    ]).pipe(
      map(
        ([contract, sessionUser]) =>
          sessionUser !== undefined &&
          contract.capabilities.includes(OperationRequestKind.ACCEPT_OWNERSHIP)
      )
    )
    this.balance$ = this.store$.select(getBalance)

    this.redeemAddress$ = this.store$.select(getRedeemAddress)
    this.redeemAddressBalance$ = this.store$.select(getRedeemAddressBalance)
    this.busyMintOperationRequests$ = this.store$.select(
      getBusyMintOperationRequests
    )
    this.busyBurnOperationRequests$ = this.store$.select(
      getBusyBurnOperationRequests
    )
    this.busyAddOperatorOperationRequests$ = this.store$.select(
      getBusyAddOperatorOperationRequests
    )
    this.busyRemoveOperatorOperationRequests$ = this.store$.select(
      getBusyRemoveOperatorOperationRequests
    )
    this.busySetRedeemAddressOperationRequests$ = this.store$.select(
      getBusySetRedeenAddressOperationRequests
    )
    this.busyTransferOwnershipOperationRequests$ = this.store$.select(
      getBusyTransferOwnershipOperationRequests
    )
    this.busyAcceptOwnershipOperationRequests$ = this.store$.select(
      getBusyAcceptOwnershipOperationRequests
    )
    this.gatekeepers$ = this.store$.select(getGatekeepers)
    this.subscriptions.push(
      combineLatest([
        this.activeContract$,
        this.store$.select(getActiveAccount),
        this.store$.select(getSessionUser),
      ])
        .pipe(
          filter(
            ([, activeAccount, sessionUser]) =>
              activeAccount !== undefined && sessionUser !== undefined
          )
        )
        .subscribe(([contract]) => {
          this.store$.dispatch(actions.loadUsers({ contractId: contract.id }))
          this.store$.dispatch(actions.loadMintOperationRequests())
          this.store$.dispatch(actions.loadBurnOperationRequests())
          this.store$.dispatch(actions.loadAddOperatorOperationRequests())
          this.store$.dispatch(actions.loadRemoveOperatorOperationRequests())
          this.store$.dispatch(actions.loadSetRedeemAddressOperationRequests())
          this.store$.dispatch(actions.loadTransferOwnershipOperationRequests())
          this.store$.dispatch(actions.loadAcceptOwnershipOperationRequests())
        })
    )
    this.subscriptions.push(
      combineLatest([
        this.store$.select(getActiveAccount),
        this.store$.select(getActiveContract),
      ])
        .pipe(
          filter(
            ([account, contract]) =>
              account !== undefined && contract !== undefined
          ),
          map(([account, contract]) => ({
            account: account!,
            contract: contract!,
          }))
        )
        .subscribe(({ account, contract }) => {
          this.store$.dispatch(actions.loadBalance())
          this.store$.dispatch(actions.loadRedeemAddress({ contract }))
        })
    )
    this.subscriptions.push(
      combineLatest([
        this.canMint$,
        this.canBurn$,
        this.canAddOperator$,
        this.canRemoveOperator$,
        this.canSetRedeemAddress$,
        this.selectedTab$,
      ]).subscribe(
        ([
          canMint,
          canBurn,
          canAddOperator,
          canRemoveOperator,
          canSetRedeemAddress,
          tab,
        ]) => {
          if (
            (!canMint && tab == Tab.MINT) ||
            (!canBurn && tab == Tab.BURN) ||
            (!canAddOperator && tab == Tab.ADD_OPERATOR) ||
            (!canRemoveOperator && tab == Tab.REMOVE_OPERATOR) ||
            (!canSetRedeemAddress && tab == Tab.SET_REDEEM_ADDRESS)
          ) {
            this.router.navigate(['/', 'transfer'])
            this.store$.dispatch(actions.selectTab({ tab: Tab.TRANSFER }))
          }
        }
      )
    )

    this.receivingAddressControl = new FormControl('', [
      Validators.required,
      Validators.minLength(36),
      Validators.maxLength(36),
      Validators.pattern('^(tz1|tz2|tz3|KT1)[1-9A-Za-z]{33}'),
    ])

    this.amountControl = new FormControl(null, [
      Validators.min(0),
      Validators.required,
      Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
    ])

    this.ledgerHashControl = new FormControl()

    this.amountTransferControl = new FormControl()
    this.amountBurnControl = new FormControl()

    this.subscriptions.push(
      combineLatest([this.balance$, this.activeContract$]).subscribe(
        ([balance, contract]) => {
          this.amountTransferControl.setValidators([
            Validators.min(0),
            Validators.max(balance?.toNumber() ?? 0),
            Validators.required,
            Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
            amountValidator(balance ?? new BigNumber(0), contract.decimals),
          ])
          this.amountTransferControl.updateValueAndValidity()
        }
      )
    )

    this.subscriptions.push(
      combineLatest([
        this.redeemAddressBalance$,
        this.activeContract$,
      ]).subscribe(([balance, contract]) => {
        this.amountBurnControl.setValidators([
          Validators.min(0),
          Validators.required,
          Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
          amountValidator(balance ?? new BigNumber(0), contract.decimals),
        ])
        this.amountBurnControl.updateValueAndValidity()
      })
    )

    this.formGroup = this.formBuilder.group({
      gatekeeperForm: ['', Validators.required],
    })
    this.setDefaults()
  }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params.tab === 'mint') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.MINT }))
      } else if (params.tab === 'burn') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.BURN }))
      } else if (params.tab === 'add-operator') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.ADD_OPERATOR }))
      } else if (params.tab === 'remove-operator') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.REMOVE_OPERATOR }))
      } else if (params.tab === 'set-redeem-address') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.SET_REDEEM_ADDRESS }))
      } else {
        this.store$.dispatch(actions.selectTab({ tab: Tab.TRANSFER }))
      }
    })
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe()
    }
  }

  setDefaults() {
    this.subscriptions.push(
      combineLatest([this.store$.select(getActiveAccount), this.gatekeepers$])
        .pipe(
          map(([activeAccount, gatekeepers]) => {
            if (activeAccount === undefined) {
              return undefined
            }
            return gatekeepers.find(
              (gatekeeper) => gatekeeper.address === activeAccount.address
            )
          })
        )
        .subscribe((activeAccount) => {
          this.formGroup
            .get('gatekeeperForm')!
            .patchValue(activeAccount ? activeAccount?.address : '')
        })
    )
  }

  connectWallet() {
    this.store$.dispatch(actions.connectWallet())
  }

  private get ledgerHash(): string | null {
    if (this.ledgerHashControl.value === undefined) {
      return null
    }
    const ledgerHash = this.ledgerHashControl.value
    if (typeof ledgerHash !== 'string') {
      return null
    }
    const ledgerHashTrimmed = ledgerHash.trim()
    if (ledgerHashTrimmed.length === 0) {
      return null
    }
    return ledgerHashTrimmed
  }

  mint() {
    this.submitOperationRequest(
      OperationRequestKind.MINT,
      this.amountControl.value,
      this.ledgerHash
    )
  }

  burn() {
    this.submitOperationRequest(
      OperationRequestKind.BURN,
      this.amountBurnControl.value,
      this.ledgerHash
    )
  }

  addOperator() {
    this.submitOperationRequest(
      OperationRequestKind.ADD_OPERATOR,
      null,
      this.ledgerHash
    )
  }

  removeOperator() {
    this.submitOperationRequest(
      OperationRequestKind.REMOVE_OPERATOR,
      null,
      this.ledgerHash
    )
  }

  setRedeemAddress() {
    this.submitOperationRequest(
      OperationRequestKind.SET_REDEEM_ADDRESS,
      null,
      this.ledgerHash
    )
  }

  transferOwnership() {
    this.submitOperationRequest(
      OperationRequestKind.TRANSFER_OWNERSHIP,
      null,
      this.ledgerHash
    )
  }

  acceptOwnership() {
    this.submitOperationRequest(
      OperationRequestKind.ACCEPT_OWNERSHIP,
      null,
      this.ledgerHash
    )
  }

  private submitOperationRequest(
    kind: OperationRequestKind,
    value: string | null,
    ledgerHash: string | null
  ) {
    let targetAddress: string | null = null
    if (kind === OperationRequestKind.MINT) {
      targetAddress = this.formGroup.get('gatekeeperForm')!.value

      validateAddress(targetAddress)
    } else if (
      kind === OperationRequestKind.ADD_OPERATOR ||
      kind === OperationRequestKind.REMOVE_OPERATOR ||
      kind === OperationRequestKind.SET_REDEEM_ADDRESS ||
      kind === OperationRequestKind.TRANSFER_OWNERSHIP
    ) {
      targetAddress = this.receivingAddressControl.value
      validateAddress(targetAddress)
    }
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.submitOperationRequest({
          newOperationRequest: {
            contract_id: contract.id,
            kind,
            amount:
              value !== null
                ? convertAmountToBigNumber(value, contract.decimals).toFixed()
                : null,
            target_address: targetAddress,
            threshold: null,
            proposed_keyholders: null,
            ledger_hash: ledgerHash ?? null,
          },
        })
      )
    })
  }

  transfer() {
    const targetAddress: string | undefined | null = this
      .receivingAddressControl.value
    validateAddress(targetAddress)
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.transferOperation({
          transferAmount: convertAmountToBigNumber(
            this.amountTransferControl.value,
            contract.decimals
          ),
          receivingAddress: this.receivingAddressControl.value,
        })
      )
    })
  }

  onSelect(event: any): void {
    const path = event.heading.toLowerCase().split(' ').join('-')
    this.router.navigate(['/', path])
    this.store$.dispatch(actions.selectTab({ tab: event.id }))
  }

  setTransferMaxValue(): void {
    this.setMaxValue(this.balance$, this.amountTransferControl)
  }

  setMaxBurnableValue(event: any): void {
    this.setMaxValue(this.redeemAddressBalance$, this.amountBurnControl)
  }

  setMaxValue(
    balance: Observable<BigNumber | undefined>,
    formControl: FormControl
  ): void {
    combineLatest([balance, this.store$.select(getActiveContract)])
      .pipe(
        take(1),
        filter(
          ([balance, contract]) =>
            balance !== undefined && contract !== undefined
        ),
        map(([balance, contract]) => ({
          balance: balance!,
          contract: contract!,
        }))
      )
      .subscribe(({ balance, contract }) => {
        formControl.setValue(
          convertBigNumberToAmount(balance, contract.decimals)
        )
      })
  }
}
