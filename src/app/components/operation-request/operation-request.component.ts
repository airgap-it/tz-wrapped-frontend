import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ModalItemComponent } from 'src/app/components/modal-item/modal-item.component'

import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Store } from '@ngrx/store'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, switchMap, take } from 'rxjs/operators'
import { User } from 'src/app/services/api/interfaces/user'
import {
  OperationRequest,
  OperationRequestKind,
  OperationRequestState,
} from 'src/app/services/api/interfaces/operationRequest'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { DeleteModalItemComponent } from '../delete-modal-item/delete-modal-item.component'
import {
  getActiveContract,
  getAddress,
  getKeyholders,
  isGatekeeper,
  isKeyholder,
} from 'src/app/app.selectors'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { CopyService } from 'src/app/services/copy/copy-service.service'

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
  public operationRequest!: OperationRequest

  public address$: Observable<string>
  public isGatekeeper$: Observable<boolean>
  public isKeyholder$: Observable<boolean>
  public keyholders$: Observable<User[]>
  public contract$: Observable<Contract>

  public currentUserApproved$: Observable<boolean>
  public multisigItems$!: Observable<UserWithApproval[]>

  public contractNonce$: Observable<number> = new Observable()

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly modalService: BsModalService,
    private readonly copyService: CopyService
  ) {
    this.address$ = this.store$.select(getAddress).pipe(isNotNullOrUndefined())
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isKeyholder$ = this.store$.select(isKeyholder)
    this.keyholders$ = this.store$.select(getKeyholders)
    this.contract$ = this.store$
      .select(getActiveContract)
      .pipe(isNotNullOrUndefined())
    this.currentUserApproved$ = this.address$.pipe(
      map((address) =>
        this.operationRequest.operation_approvals.some(
          (approval) => approval.keyholder.address === address
        )
      )
    )
  }

  async ngOnInit(): Promise<void> {
    const operationRequestId = this.operationRequest.id
    const proposed_keyholders = this.operationRequest.proposed_keyholders
    if (this.operationRequest.state !== OperationRequestState.INJECTED) {
      this.multisigItems$ = combineLatest([
        this.keyholders$,
        this.address$,
      ]).pipe(
        map(([keyholders, address]) =>
          keyholders.map((user) => ({
            ...user,
            requestId: operationRequestId,
            isCurrentUser: user.address === address,
            hasApproval: this.operationRequest.operation_approvals.some(
              (approval) => approval.keyholder.id === user.id
            ),
            updated_at:
              this.operationRequest.operation_approvals.find(
                (operationApproval) =>
                  operationApproval.keyholder.id === user.id
              )?.created_at ?? '',
          }))
        )
      )
    } else {
      this.multisigItems$ = this.address$.pipe(
        map((address) =>
          this.operationRequest.operation_approvals.map((approval) => ({
            ...approval.keyholder,
            requestId: operationRequestId,
            isCurrentUser: approval.keyholder.address === address,
            hasApproval: true,
          }))
        )
      )
    }
    this.contractNonce$ = this.contract$.pipe(
      switchMap((contract) =>
        this.store$
          .select((state) => state.app.contractNonces.get(contract.id))
          .pipe(
            filter((value) => value !== undefined),
            map((value) => value!)
          )
      )
    )
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

  public delete() {
    const contractNonces$ = this.store$.select(
      (state) => state.app.contractNonces
    )

    this.modalService.show(DeleteModalItemComponent, {
      class: 'modal-lg',
      initialState: {
        operationRequest: this.operationRequest,
        contractNonces$: contractNonces$,
      },
    })
  }

  public markInjected() {
    this.store$.dispatch(
      actions.updateOperationRequestStateToInjected({
        operationRequest: this.operationRequest,
        injectedOperationHash: null,
      })
    )
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }
}
