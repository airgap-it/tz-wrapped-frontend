import { InjectionToken } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  ActionsSubject,
  ReducerManager,
  ReducerManagerDispatcher,
  StateObservable,
  StoreModule,
} from '@ngrx/store'
import { ROOT_REDUCERS } from 'src/app/reducers'

import { OperationRequestComponent } from './operation-request.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { UserKind, UserState } from 'src/app/services/api/interfaces/user'
import {
  OperationRequestKind,
  OperationRequestState,
} from 'src/app/services/api/interfaces/operationRequest'
import { ShortenPipe } from 'src/app/pipes/shorten.pipe'
import { AmountConverterPipe } from 'src/app/pipes/amount.pipe'
import { initialState as appInitialState, State } from '../../app.reducer'
import { ContractKind } from 'src/app/services/api/interfaces/contract'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

describe('OperationRequestComponent', () => {
  let component: OperationRequestComponent
  let fixture: ComponentFixture<OperationRequestComponent>
  const initialState: { app: State } = {
    app: {
      ...appInitialState,
      activeContract: {
        decimals: 8,
        id: '',
        created_at: '',
        updated_at: '',
        pkh: '',
        token_id: 0,
        min_approvals: 2,
        multisig_pkh: '',
        kind: ContractKind.FA1,
        display_name: '',
        symbol: 'tez',
        capabilities: [],
      },
    },
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), StoreModule.forRoot(ROOT_REDUCERS)],
      declarations: [
        OperationRequestComponent,
        ShortenPipe,
        AmountConverterPipe,
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        MockStore,
        StateObservable,
        ActionsSubject,
        ReducerManager,
        ReducerManagerDispatcher,
        { provide: InjectionToken, useValue: ROOT_REDUCERS },
        BsModalService,
        BsModalRef,
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationRequestComponent)
    component = fixture.componentInstance
    component.operationRequest = {
      id: '',
      created_at: '',
      updated_at: '',
      user: {
        id: '',
        created_at: '',
        updated_at: '',
        address: '',
        public_key: '',
        contract_id: '',
        kind: UserKind.GATEKEEPER,
        state: UserState.ACTIVE,
        display_name: '',
      },
      contract_id: '',
      target_address: '',
      amount: '1',
      threshold: 2,
      proposed_keyholders: [],
      kind: OperationRequestKind.MINT,
      chain_id: '',
      nonce: 0,
      state: OperationRequestState.OPEN,
      operation_approvals: [],
      operation_hash: '',
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
