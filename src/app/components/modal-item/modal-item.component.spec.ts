import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ModalItemComponent } from './modal-item.component'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { ContractKind } from 'src/app/services/api/interfaces/contract'

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
    component.contract = {
      id: '',
      created_at: '',
      updated_at: '',
      pkh: '',
      token_id: 0,
      multisig_pkh: '',
      kind: ContractKind.FA1,
      display_name: '',
      decimals: 0,
      symbol: '',
      min_approvals: 0,
      capabilities: [],
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
