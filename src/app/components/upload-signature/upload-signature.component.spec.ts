import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActionsSubject, StateObservable } from '@ngrx/store'
import { provideMockStore } from '@ngrx/store/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'

import { UploadSignatureComponent } from './upload-signature.component'

describe('UploadSignatureComponent', () => {
  let component: UploadSignatureComponent
  let fixture: ComponentFixture<UploadSignatureComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [UploadSignatureComponent],
      providers: [
        provideMockStore({}),
        BsModalRef,
        StateObservable,
        ActionsSubject,
        BsModalService,
      ],
    }).compileComponents()
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSignatureComponent)
    component = fixture.componentInstance
    component.signableMessage = {
      tezos_client_command: '',
      message: '',
      blake2b_hash: '',
    }

    component.operationRequest = {} as any
    fixture.detectChanges()
  })
  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
