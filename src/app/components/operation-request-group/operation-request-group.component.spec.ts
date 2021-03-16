import { ComponentFixture, TestBed } from '@angular/core/testing'

import { OperationRequestGroupComponent } from './operation-request-group.component'

describe('OperationRequestGroupComponent', () => {
  let component: OperationRequestGroupComponent
  let fixture: ComponentFixture<OperationRequestGroupComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationRequestGroupComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationRequestGroupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
