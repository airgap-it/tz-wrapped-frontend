import { InjectionToken } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  ActionsSubject,
  ReducerManager,
  ReducerManagerDispatcher,
  StateObservable,
  Store,
} from '@ngrx/store'
import { ROOT_REDUCERS } from 'src/app/reducers'

import { OperationRequestComponent } from './operation-request.component'
import * as fromApp from '../../app.reducer'

describe('OpenMintingRequestComponent', () => {
  let component: OperationRequestComponent
  let fixture: ComponentFixture<OperationRequestComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationRequestComponent],
      providers: [
        Store,
        StateObservable,
        ActionsSubject,
        ReducerManager,
        ReducerManagerDispatcher,
        { provide: InjectionToken, useValue: ROOT_REDUCERS },
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
