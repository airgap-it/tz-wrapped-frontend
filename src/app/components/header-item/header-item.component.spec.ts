import { HeaderItemComponent } from "./header-item.component";

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { TestScheduler } from "rxjs/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { EMPTY } from "rxjs";

import { initialState as appInitialState } from "../../app.reducer";

describe("HeaderItemComponent", () => {
  let component: HeaderItemComponent;
  let fixture: ComponentFixture<HeaderItemComponent>;
  let testScheduler: TestScheduler;
  let storeMock: MockStore<any>;
  const initialState = { app: appInitialState };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
      ],
      declarations: [HeaderItemComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(HeaderItemComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
