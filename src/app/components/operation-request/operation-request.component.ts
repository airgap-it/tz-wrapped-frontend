import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ModalItemComponent } from 'src/app/components/modal-item/modal-item.component'

import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { filter, map, take } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { User } from 'src/app/services/api/interfaces/user'
import { OperationRequest } from 'src/app/services/api/interfaces/operationRequest'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { OperationApproval } from 'src/app/services/api/interfaces/operationApproval'

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
export class OperationRequestComponent implements OnInit, OnDestroy {
  @Input()
  public operationRequest!: OperationRequest

  @Input()
  public address!: string

  @Input()
  public isGatekeeper: boolean = false

  @Input()
  public isKeyholder: boolean = false

  @Input()
  public keyholders: User[] = []

  @Input()
  public contract!: Contract

  private operationApprovals$: Observable<
    OperationApproval[]
  > = new Observable()

  public currentUserApproved$: Observable<boolean> = new Observable()
  public multisigItems: UserWithApproval[] = []

  public currentOperationApprovals$: Observable<number> = new Observable()

  public contractNonce$: Observable<number> = new Observable()

  private operationApprovalsSubscription!: Subscription | undefined

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly modalService: BsModalService
  ) {}

  async ngOnInit(): Promise<void> {
    const operationRequestId = this.operationRequest.id
    this.store$.dispatch(
      actions.loadOperationApprovals({ operationRequestId: operationRequestId })
    )
    this.operationApprovals$ = this.store$.select(
      (state) => state.app.operationApprovals.get(operationRequestId) ?? []
    )
    this.contractNonce$ = this.store$
      .select((state) => state.app.contractNonces.get(this.contract.id))
      .pipe(
        filter((value) => value !== undefined),
        map((value) => value!)
      )

    this.operationApprovalsSubscription = this.operationApprovals$.subscribe(
      (operationApprovals) => {
        this.multisigItems = this.keyholders.map((user) => ({
          ...user,
          requestId: operationRequestId,
          isCurrentUser: user.address === this.address,
          hasApproval: operationApprovals.some(
            (approval) => approval.keyholder.id === user.id
          ),
          updated_at:
            operationApprovals.find(
              (operationApproval) => operationApproval.keyholder.id === user.id
            )?.created_at ?? '',
        }))
      }
    )
    this.currentOperationApprovals$ = this.store$.select(
      (store) =>
        store.app.operationApprovals.get(operationRequestId)?.length ?? 0
    )
    this.currentUserApproved$ = this.store$.select(
      (store) =>
        store.app.operationApprovals
          .get(operationRequestId)
          ?.some((approval) => approval.keyholder.address === this.address) ??
        false
    )
  }

  ngOnDestroy() {
    this.operationApprovalsSubscription?.unsubscribe()
  }

  public submitOperation() {
    this.store$.dispatch(
      actions.getOperationRequestParameters({
        operationRequest: this.operationRequest,
      })
    )
  }

  public approveOperationRequest() {
    this.store$.dispatch(
      actions.getSignableMessage({
        operationRequestId: this.operationRequest.id,
      })
    )
    this.store$
      .select((state) =>
        state.app.signableMessages.get(this.operationRequest.id)
      )
      .pipe(
        filter((signableMessage) => signableMessage !== undefined),
        map((signableMessage) => signableMessage!),
        take(1)
      )
      .subscribe((signableMessage) =>
        this.store$.dispatch(
          actions.approveOperationRequest({
            signableMessage,
            operationRequest: this.operationRequest,
          })
        )
      )
  }

  public openModal() {
    this.store$
      .select((state) =>
        state.app.signableMessages.get(this.operationRequest.id)
      )
      .pipe(take(1))
      .subscribe((signableMessage) => {
        if (signableMessage === undefined) {
          this.store$.dispatch(
            actions.getSignableMessage({
              operationRequestId: this.operationRequest.id,
            })
          )
        }
      })
    this.store$
      .select((state) =>
        state.app.signableMessages.get(this.operationRequest.id)
      )
      .pipe(
        filter((signableMessage) => signableMessage !== undefined),
        map((signableMessage) => signableMessage!),
        take(1)
      )
      .subscribe((signableMessage) => {
        const modalRef = this.modalService.show(ModalItemComponent, {
          class: 'modal-lg',
          initialState: {
            signableMessage,
          },
        })
      })
  }

  delete() {
    this.store$.dispatch(
      actions.deleteOperationRequest({
        operationRequest: this.operationRequest,
      })
    )
  }

  markInjected() {
    this.store$.dispatch(
      actions.updateOperationRequestStateToInjected({
        operationRequest: this.operationRequest,
        injectedOperationHash: null,
      })
    )
  }
}
