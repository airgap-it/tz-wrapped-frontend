import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'

import { MultiSignatureItemComponent } from './multi-signature-item.component'

describe('MultiSignatureItemComponent', () => {
  let component: MultiSignatureItemComponent
  let fixture: ComponentFixture<MultiSignatureItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [MultiSignatureItemComponent],
      providers: [BsModalService, BsModalRef],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSignatureItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
