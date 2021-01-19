import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ModalItemComponent } from './modal-item.component'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'

describe('ModalItemComponent', () => {
  let component: ModalItemComponent
  let fixture: ComponentFixture<ModalItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [ModalItemComponent],
      providers: [BsModalRef, BsModalService],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalItemComponent)
    component = fixture.componentInstance
    component.signableMessage = {
      tezos_client_command: '',
      message: '',
      blake2b_hash: '',
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
