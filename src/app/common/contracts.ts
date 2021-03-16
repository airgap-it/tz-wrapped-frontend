import { Store } from '@ngrx/store'
import { Subscription } from 'rxjs'
import { getActiveContract } from '../app.selectors'
import * as fromRoot from '../reducers/index'
import * as actions from '../app.actions'

export const loadContractsIfNeeded = (
  store$: Store<fromRoot.State>
): Subscription => {
  return store$.select(getActiveContract).subscribe((contract) => {
    if (contract === undefined) {
      store$.dispatch(actions.loadContracts())
    }
  })
}
