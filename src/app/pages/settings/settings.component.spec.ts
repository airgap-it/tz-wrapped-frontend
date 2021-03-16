import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SettingsComponent } from './settings.component'
import { initialState as appInitialState } from '../../app.reducer'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { FormBuilder } from '@angular/forms'
import { RouterTestingModule } from '@angular/router/testing'

const fakeActivatedRoute = {
  snapshot: { data: {} },
}

describe('SettingsComponent', () => {
  let component: SettingsComponent
  let fixture: ComponentFixture<SettingsComponent>
  let testScheduler: TestScheduler
  let storeMock: MockStore<any>
  const initialState = { app: appInitialState }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        FormBuilder,
      ],
      declarations: [SettingsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    })

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })

    fixture = TestBed.createComponent(SettingsComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
