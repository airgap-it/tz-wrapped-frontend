import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { combineLatest, Observable } from 'rxjs'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Contract, User } from 'src/app/services/api/api.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss'],
})
export class HeaderItemComponent implements OnInit {
  public address$: Observable<string>
  public users$: Observable<User[]>
  public address: string = ''
  public asset$: Observable<string>
  private contracts$: Observable<Contract[]>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.address$ = this.store$.select(
      (state) => state.app.activeAccount?.address ?? ''
    )
    this.users$ = this.store$.select((state) => state.app.users)
    this.asset$ = this.store$.select(
      (state) => state.app.activeContract?.display_name ?? ''
    )
    this.contracts$ = this.store$.select((state) => state.app.contracts)

    combineLatest([this.address$, this.users$])
      .pipe(
        map(
          ([address, users]) =>
            users.find((user) => user.address === address)?.display_name ??
            address
        )
      )
      .subscribe((res) => {
        this.address = res
      })
  }

  ngOnInit(): void {}

  reset(): void {
    this.store$.dispatch(actions.disconnectWallet())
  }

  changeContract(contract: Contract) {
    this.store$.dispatch(actions.setActiveContract({ contract }))
  }
}
