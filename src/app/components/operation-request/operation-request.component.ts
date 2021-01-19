import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core'
import {
  ApiService,
  Contract,
  OperationApproval,
  OperationRequest,
  OperationRequestState,
  User,
  UserKind,
} from 'src/app/services/api/api.service'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ModalItemComponent } from 'src/app/components/modal-item/modal-item.component'

import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { distinct, filter, map, take, takeUntil } from 'rxjs/operators'
import { Subscription } from 'rxjs'

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
  operationRequest!: OperationRequest

  @Input()
  address!: string

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

  public currentUserApproved: Observable<boolean> = new Observable()
  public multisigItems: UserWithApproval[] = []

  public currentOperationApprovals$: Observable<number> = new Observable()
  public maxOperationApprovals$: Observable<number> = new Observable()

  public contractNonce$: Observable<number> = new Observable()

  private operationApprovalsSubscription!: Subscription | undefined

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly modalService: BsModalService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.operationRequest === undefined) {
      throw new Error('Operation Request not loaded')
    }
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

  openModal() {
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
}
