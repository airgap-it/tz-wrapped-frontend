import { InjectionToken } from '@angular/core'
import {
  Action,
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
  Store,
} from '@ngrx/store'

import { environment } from '../../environments/environment'

import * as fromApp from '../app.reducer'

export interface State {
  app: fromApp.State
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const ROOT_REDUCERS = new InjectionToken<
  ActionReducerMap<State, Action>
>('Root reducers token', {
  factory: () => ({
    app: fromApp.reducer,
  }),
})

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state, action) => {
    const result = reducer(state, action)
    console.groupCollapsed(action.type)
    console.log('prev state', state)
    console.log('action', action)
    console.log('next state', result)
    console.groupEnd()

    return result
  }
}

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [logger]
  : []

export const appKey = 'app'
export const selectApp = createFeatureSelector<State, fromApp.State>(appKey)
