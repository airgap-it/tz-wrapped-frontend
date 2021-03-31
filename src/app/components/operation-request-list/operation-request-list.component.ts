import { Component, Input, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { PagedResponse } from '../../services/api/interfaces/common'
import { Contract } from '../../services/api/interfaces/contract'
import {
  OperationRequest,
  OperationRequestKind,
  OperationRequestState,
} from '../../services/api/interfaces/operationRequest'
import { User } from '../../services/api/interfaces/user'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'

@Component({
  selector: 'operation-request-list',
  templateUrl: './operation-request-list.component.html',
  styleUrls: ['./operation-request-list.component.scss'],
})
export class OperationRequestListComponent implements OnInit {
  @Input()
  public title!: string

  @Input()
  public kind!: OperationRequestKind

  @Input()
  public state!: OperationRequestState

  @Input()
  public operationRequestList!: PagedResponse<OperationRequest>

  constructor(private readonly store$: Store<fromRoot.State>) {}

  ngOnInit(): void {}

  public loadPreviousPage() {
    this.store$.dispatch(
      actions.loadOperationRequestPage({
        kind: this.kind,
        state: this.state,
        page: this.operationRequestList.page - 1,
      })
    )
  }

  public loadNextPage() {
    this.store$.dispatch(
      actions.loadOperationRequestPage({
        kind: this.kind,
        state: this.state,
        page: this.operationRequestList.page + 1,
      })
    )
  }
}
