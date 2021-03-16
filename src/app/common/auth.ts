import { Store } from '@ngrx/store'
import { combineLatest, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { getActiveAccount, getSessionUser } from '../app.selectors'
import * as fromRoot from '../reducers/index'
import * as actions from '../app.actions'

export const signIn = (store$: Store<fromRoot.State>): Subscription => {
  return combineLatest([
    store$.select(getSessionUser),
    store$.select(getActiveAccount),
  ])
    .pipe(
      filter(([user, account]) => user === undefined && account !== undefined),
      map(([, account]) => account!)
    )
    .subscribe((account) => {
      store$.dispatch(actions.getSignInChallenge({ address: account.address }))
    })
}
