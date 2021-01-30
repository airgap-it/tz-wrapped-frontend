import { Component, Input, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { HttpErrorResponse } from '@angular/common/http'
import { getAlerts } from 'src/app/app.selectors'
import { ErrorDescription } from './error-description'

@Component({
  selector: 'app-error-item',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorItemComponent implements OnInit {
  public errors$: Observable<ErrorDescription[] | null>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.errors$ = this.store$.select(getAlerts)
  }

  ngOnInit(): void {}

  clearAlerts() {
    this.store$.dispatch(actions.clearAlerts())
  }
}
