import { Component, Input, OnInit, OnChanges } from '@angular/core'
import {
  ApiService,
  OperationApproval,
  OperationRequest,
  OperationRequestState,
  User,
  UserKind,
} from 'src/app/services/api/api.service'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

export interface UserWithApproval extends User {
  requestId: string
  isCurrentUser: boolean
  hasApproval: boolean
}

@Component({
  selector: 'operation-request[operationRequest]',
  templateUrl: './operation-request.component.html',
  styleUrls: ['./operation-request.component.scss'],
})
export class OperationRequestComponent implements OnInit {
  @Input()
  operationRequest: OperationRequest | undefined

  @Input()
  address: string = ''

  @Input()
  public isGatekeeper: boolean = false

  @Input()
  public isKeyholder: boolean = false

  private operationApprovals$: Observable<
    OperationApproval[]
  > = new Observable()

  public currentUserApproved: Observable<boolean> = new Observable()
  public multisigItems$: Observable<UserWithApproval[]> = new Observable()

  public currentOperationApprovals$: Observable<number> = new Observable()
  public maxOperationApprovals$: Observable<number> = new Observable()

  constructor(private readonly store$: Store<fromRoot.State>) {}

  async ngOnInit(): Promise<void> {
    if (this.operationRequest === undefined) {
      throw new Error('Operation Request not loaded')
    }
    const operationRequestId = this.operationRequest.id
    this.store$.dispatch(
      actions.loadOperationApprovals({ requestId: operationRequestId })
    )
    this.operationApprovals$ = this.store$.select(
      (state) => state.app.operationApprovals.get(operationRequestId) ?? []
    )
    this.operationApprovals$.subscribe((operationApprovals) => {
      this.multisigItems$ = this.store$.select((state) => {
        return state.app.users
          .filter((user) => user.kind === UserKind.KEYHOLDER)
          .map((user) => ({
            ...user,
            requestId: operationRequestId,
            isCurrentUser: user.address === this.address,
            hasApproval: operationApprovals.some(
              (approval) => approval.keyholder.id === user.id
            ),
            updated_at:
              operationApprovals.find(
                (operationApproval) =>
                  operationApproval.keyholder.id === user.id
              )?.created_at ?? '',
          }))
      })
    })
    this.maxOperationApprovals$ = this.store$.select(
      (store) =>
        store.app.users.filter((user) => user.kind === UserKind.KEYHOLDER)
          .length
    )
    this.currentOperationApprovals$ = this.store$.select(
      (store) =>
        store.app.operationApprovals.get(operationRequestId)?.length ?? 0
    )
    this.currentUserApproved = this.store$.select(
      (store) =>
        store.app.operationApprovals
          .get(operationRequestId)
          ?.some((approval) => approval.keyholder.address === this.address) ??
        false
    )
  }

  public submitOperation() {
    if (this.operationRequest) {
      const requestId = this.operationRequest.id
      this.store$.dispatch(
        actions.getOperationRequestParameters({
          operationId: requestId,
        })
      )
    }
  }

  public approveOperationRequest() {
    if (this.operationRequest !== undefined) {
      const id = this.operationRequest.id
      this.store$.dispatch(
        actions.getApprovableOperationRequest({
          requestId: id,
        })
      )
    }
  }
}
