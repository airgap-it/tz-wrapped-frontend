import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { combineLatest, Observable } from 'rxjs'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../app.actions'
import { User } from 'src/app/services/api/api.service'
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

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.address$ = this.store$.select((state) => state.app.address)
    this.users$ = this.store$.select((state) => (state.app as any).app.users)
    this.users$.subscribe((users) => console.log('USERS', users))

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

  ngOnInit(): void {
    this.store$.dispatch(actions.loadAddress())
  }

  reset(): void {
    this.store$.dispatch(actions.disconnectWallet())
  }
}
