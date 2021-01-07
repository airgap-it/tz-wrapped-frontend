import { Component, EventEmitter, Input, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import {
  AbstractControl,
  FormControl,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { BeaconService } from '../../services/beacon/beacon.service'
import {
  Approval,
  Contract,
  Operation,
  User,
} from 'src/app/services/api/api.service'
import { Observable } from 'rxjs'
import BigNumber from 'bignumber.js'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() buttonLabel: string | undefined

  public selectedTab: 'tab0' | 'tab1' | 'tab2' = 'tab0' // Rename to "tab-mint", etc.

  receivingAddressControl: FormControl
  amountTransferControl: FormControl
  amountControl: FormControl
  // receivingAddress$: Observable<string>;
  dataEmitter: EventEmitter<any[]> = new EventEmitter<any[]>()
  public address$: Observable<string | null>
  public pendingMintingRequests$: Observable<Operation[] | null>
  public approvedMintingRequests$: Observable<Operation[] | null>
  public users$: Observable<User[] | null>
  public approvals$: Observable<Approval[] | null>
  public mintingRequests$: Observable<Operation[]>
  public currentUserType$: Observable<'keyholder' | 'gatekeeper' | undefined> // TODO: Create proper type and use it everywhere
  public balance$: Observable<BigNumber | undefined>
  public asset$: Observable<string>
  public activeContract$: Observable<Contract | undefined>
  public activeContractId$: Observable<string | undefined>

  constructor(
    private readonly store$: Store<fromRoot.State>, // private readonly beaconService: BeaconService
    private readonly beaconService: BeaconService
  ) {
    this.store$.dispatch(actions.loadContracts())
    this.asset$ = this.store$.select((state) => state.app.asset)

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

    this.beaconService.setupBeaconWallet()

    this.mintingRequests$ = this.store$.select(
      (state) => state.app.mintingOperations
    )

    this.pendingMintingRequests$ = this.store$.select(
      (state) => state.app.pendingMintingOperations
    )

    // this.pendingMintingRequests$ = this.store$.select((state) =>
    //   state.app.mintingOperations.filter(
    //     (request: any) => request.state !== 'approved'
    //   )
    // )

    this.approvedMintingRequests$ = this.store$.select((state) =>
      state.app.mintingOperations.filter(
        (request: any) => request.state === 'approved'
      )
    )

    this.users$ = this.store$.select((state) => state.app.users)
    this.approvals$ = this.store$.select((state) => state.app.approvals)
    this.address$ = this.store$.select((state) => state.app.address)

    this.balance$ = this.store$.select((state) => state.app.balance)

    this.amountTransferControl = new FormControl(null, [
      Validators.min(0),
      // Validators.max(balance.toNumber()), //TODO: disabled for now, need to figure out a way to use value of observable
      Validators.required,
      Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
    ])

    this.currentUserType$ = new Observable<undefined>()
    this.address$.subscribe((address) => {
      this.currentUserType$ = this.store$.select(
        (state) =>
          state.app.users.find((user) => user.address === address)?.kind
      )
    })
    this.activeContract$ = this.store$.select(
      (state) => state.app.activeContract
    )
    this.activeContractId$ = this.store$.select(
      (state) => state.app.activeContract?.id
    )
    this.activeContractId$.subscribe((active) =>
      console.log('active contract in dash: ', active)
    )
  }

  ngOnInit(): void {
    this.store$.dispatch(actions.loadContracts()) // TODO: Load this in a higher component?
    // TODO: Use active contract (dependent on the selection)

    this.activeContractId$.subscribe((contractId) => {
      if (contractId) {
        console.log('okay')
        this.store$.dispatch(actions.loadUsers({ contractId: contractId }))
        this.store$.dispatch(
          actions.loadMintingRequests({
            contractId: contractId,
          })
        )
      }
    })

    this.store$.dispatch(actions.loadBalance())
  }

  updateAllMintingRequests(): void {
    this.pendingMintingRequests$ = this.store$.select(
      (state) => state.app.pendingMintingOperations
    )
    // this.pendingMintingRequests$ = this.store$.select((state) =>
    //   state.app.mintingOperations.filter(
    //     (request: any) => request.state !== 'approved'
    //   )
    // )

    this.approvedMintingRequests$ = this.store$.select((state) =>
      state.app.mintingOperations.filter(
        (request: any) => request.state === 'approved'
      )
    )
  }

  connectWallet() {
    this.store$.dispatch(actions.connectWallet())
  }

  mint() {
    const receivingAddressCondition =
      this.receivingAddressControl.value &&
      this.receivingAddressControl.value.length === 36 &&
      this.receivingAddressControl.value.startsWith('tz1')

    if (!receivingAddressCondition) {
      throw new Error(`Address invalid: ${this.receivingAddressControl.value}`)
    }

    const amountCondition =
      this.amountControl.value && Number(this.amountControl.value)

    if (!amountCondition) {
      throw new Error(`Amount invalid: ${this.amountControl.value}`)
    }

    this.activeContractId$.subscribe((contractId) => {
      if (contractId) {
        console.log('okay 2')
        this.store$.dispatch(
          actions.requestMintOperation({
            contractId: contractId,
            mintAmount: this.amountControl.value,
            receivingAddress: this.receivingAddressControl.value,
          })
        )
      }
    })

    this.updateAllMintingRequests()
    // this.beaconService.transferOperation(
    //   Number(this.amountControl.value),
    //   this.receivingAddressControl.value
    // )
  }

  burn() {
    console.log('burn')
  }

  transfer() {
    console.log('transfer')

    const receivingAddressCondition =
      this.receivingAddressControl.value &&
      this.receivingAddressControl.value.length === 36 &&
      this.receivingAddressControl.value.startsWith('tz1')

    if (this.amountTransferControl.value && receivingAddressCondition) {
      this.store$.dispatch(
        actions.transferOperation({
          transferAmount: Number(this.amountTransferControl.value),
          receivingAddress: this.receivingAddressControl.value,
        })
      )
    } else {
      console.log('invalid inputs')
    }
  }

  onSelect(event: any): void {
    this.selectedTab = event.id
  }

  setMaxValue(): void {
    this.balance$.subscribe((balance) => {
      this.amountTransferControl.setValue(balance)
    })
  }
}
