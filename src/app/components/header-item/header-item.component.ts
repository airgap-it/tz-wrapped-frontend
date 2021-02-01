import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { combineLatest, Observable } from 'rxjs'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { map } from 'rxjs/operators'
import { Contract } from 'src/app/services/api/interfaces/contract'
import {
  getActiveAccount,
  getActiveContract,
  getContracts,
  getUsers,
} from 'src/app/app.selectors'

@Component({
  selector: 'app-header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss'],
})
export class HeaderItemComponent implements OnInit {
  public name$: Observable<string | undefined>
  public activeContract$: Observable<Contract | undefined>
  public contracts$: Observable<Contract[]>
  public imageSrcMap$: Observable<Map<string, string>>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.activeContract$ = this.store$.select(getActiveContract)
    this.contracts$ = this.store$.select(getContracts)
    this.imageSrcMap$ = this.contracts$.pipe(
      map(
        (contracts) =>
          new Map<string, string>(
            contracts.map((contract) => [
              contract.id,
              `/assets/img/${contract.display_name.toLowerCase()}.svg`,
            ])
          )
      )
    )
    this.name$ = combineLatest([
      this.store$.select(getActiveAccount),
      this.store$.select(getUsers),
    ]).pipe(
      map(([activeAccount, users]) => {
        if (activeAccount === undefined) {
          return undefined
        }
        return (
          users.find((user) => user.address === activeAccount.address)
            ?.display_name ?? activeAccount.address
        )
      })
    )
  }

  ngOnInit(): void {}

  reset(): void {
    this.store$.dispatch(actions.disconnectWallet())
  }

  changeContract(contract: Contract) {
    this.store$.dispatch(actions.setActiveContract({ contract }))
  }
}
