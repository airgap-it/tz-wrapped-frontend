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

import { OpenMintingRequestComponent } from './open-minting-request.component'
import * as fromApp from '../../app.reducer'

describe('OpenMintingRequestComponent', () => {
  let component: OpenMintingRequestComponent
  let fixture: ComponentFixture<OpenMintingRequestComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenMintingRequestComponent],
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
    fixture = TestBed.createComponent(OpenMintingRequestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
