import { Component, EventEmitter, Input, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../app.actions'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'
import { BeaconService } from '../../services/beacon/beacon.service'
import { Approval, Operation, User } from 'src/app/services/api/api.service'
// import { BeaconService } from "src/app/services/beacon/beacon.service";

const CONTRACT_ID = '73ec5d6c-2a68-45e0-9d6c-5b02d025426e'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() buttonLabel: string | undefined

  receivingAddressControl: FormControl
  amountControl: FormControl
  // receivingAddress$: Observable<string>;
  dataEmitter: EventEmitter<any[]> = new EventEmitter<any[]>()
  public address: string | null = null
  public pendingMintingRequests: Operation[] | null = null
  public approvedMintingRequests: Operation[] | null = null
  public users: User[] | null = null
  public approvals: Approval[] | null = null

  constructor(
    private readonly store$: Store<fromRoot.State>, // private readonly beaconService: BeaconService
    private readonly beaconService: BeaconService
  ) {
    // localStorage.clear();
    this.receivingAddressControl = new FormControl('')
    this.amountControl = new FormControl(null)
    this.beaconService.setupBeaconWallet()

    const s = this.store$.select((state) => state.app)
    s.subscribe((res) => {
      // TODO: Why is res not "App"?
      console.log('app', res)
      this.pendingMintingRequests = (res as any).app.mintingOperations.filter(
        (request: any) => request.state !== 'approved'
      )
      this.approvedMintingRequests = (res as any).app.mintingOperations.filter(
        (request: any) => request.state === 'approved'
      )
      this.users = (res as any).app.users
      this.approvals = (res as any).app.approvals
      this.address = (res as any).app.address
    })
    // TODO: Why doesn't this work?
    // this.mintingRequests$ = this.store$.select((state) => state.app.mintingOperations)
  }

  ngOnInit(): void {
    this.store$.dispatch(actions.loadContracts()) // TODO: Load this in a higher component?
    this.store$.dispatch(actions.loadUsers({ contractId: CONTRACT_ID }))
    this.store$.dispatch(
      actions.loadMintingRequests({
        contractId: CONTRACT_ID,
      })
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

    this.store$.dispatch(
      actions.requestMintOperation({
        contractId: CONTRACT_ID,
        mintAmount: this.amountControl.value,
        receivingAddress: this.receivingAddressControl.value,
      })
    )
    // this.beaconService.transferOperation(
    //   Number(this.amountControl.value),
    //   this.receivingAddressControl.value
    // );
  }

  burn() {
    console.log('burn')
    this.connectWallet()
  }

  transfer() {
    console.log('transfer')

    const receivingAddressCondition =
      this.receivingAddressControl.value &&
      this.receivingAddressControl.value.length === 36 &&
      this.receivingAddressControl.value.startsWith('tz1')

    const amountCondition =
      this.amountControl.value && Number(this.amountControl.value)

    if (amountCondition && receivingAddressCondition) {
      this.store$.dispatch(
        actions.transferOperation({
          transferAmount: Number(this.amountControl.value),
          receivingAddress: this.receivingAddressControl.value,
        })
      )
      // this.beaconService.transferOperation(
      //   Number(this.amountControl.value),
      //   this.receivingAddressControl.value
      // );
    } else {
      console.log('invalid inputs')
    }
  }
}
