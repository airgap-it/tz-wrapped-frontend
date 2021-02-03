import { InjectionToken } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  ActionsSubject,
  ReducerManager,
  ReducerManagerDispatcher,
  StateObservable,
} from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { ROOT_REDUCERS } from 'src/app/reducers'
import { OperationRequestState } from 'src/app/services/api/interfaces/operationRequest'
import { UserKind, UserState } from 'src/app/services/api/interfaces/user'

import { DeleteModalItemComponent } from './delete-modal-item.component'

describe('DeleteModalItemComponent', () => {
  let component: DeleteModalItemComponent
  let fixture: ComponentFixture<DeleteModalItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [DeleteModalItemComponent],
      providers: [
        provideMockStore({}),
        MockStore,
        StateObservable,
        ActionsSubject,
        BsModalService,
        BsModalRef,
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteModalItemComponent)
    component = fixture.componentInstance
    component.operationRequest = {
      id: '',
      created_at: '',
      updated_at: '',
      gatekeeper: {
        id: '',
        created_at: '',
        updated_at: '',
        address: '',
        contract_id: '',
        kind: UserKind.GATEKEEPER,
        state: UserState.ACTIVE,
        display_name: '',
      },
      contract_id: '',
      target_address: '',
      amount: '',
      kind: '',
      signature: '',
      chain_id: '',
      nonce: 0,
      state: OperationRequestState.OPEN,
      operation_approvals: [
        {
          id: '',
          created_at: '',
          updated_at: '',
          keyholder: {
            id: '',
            created_at: '',
            updated_at: '',
            address: '',
            contract_id: '',
            kind: UserKind.GATEKEEPER,
            state: UserState.ACTIVE,
            display_name: '',
          },
          operation_request_id: '',
          signature: '',
        },
      ],
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
