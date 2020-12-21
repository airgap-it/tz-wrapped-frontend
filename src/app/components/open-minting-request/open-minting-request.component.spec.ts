import { ComponentFixture, TestBed } from '@angular/core/testing'

import { OpenMintingRequestComponent } from './open-minting-request.component'

describe('OpenMintingRequestComponent', () => {
  let component: OpenMintingRequestComponent
  let fixture: ComponentFixture<OpenMintingRequestComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenMintingRequestComponent],
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
