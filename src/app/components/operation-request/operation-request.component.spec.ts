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

describe('OpenMintingRequestComponent', () => {
  let component: OperationRequestComponent
  let fixture: ComponentFixture<OperationRequestComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), StoreModule.forRoot(ROOT_REDUCERS)],
      declarations: [OperationRequestComponent],
      providers: [
        provideMockStore({}),
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
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
