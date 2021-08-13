import { Component, Input, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { SignableMessageInfo } from 'src/app/services/api/interfaces/common'
import { CopyService } from 'src/app/services/copy/copy-service.service'
import { OperationRequest } from 'src/app/services/api/interfaces/operationRequest'

@Component({
  selector: 'app-upload-signature',
  templateUrl: './upload-signature.component.html',
  styleUrls: ['./upload-signature.component.scss'],
})
export class UploadSignatureComponent implements OnInit {
  @Input()
  signableMessage!: SignableMessageInfo | undefined

  @Input()
  public operationRequest!: OperationRequest

  public signatureControl: FormControl

  constructor(
    public bsModalRef: BsModalRef,
    private readonly copyService: CopyService,
    private readonly store$: Store<fromRoot.State>
  ) {
    this.signatureControl = new FormControl('', [
      Validators.required,
      Validators.pattern(/^edsig[\da-zA-Z]{94}$/),
    ])
  }

  ngOnInit(): void {}

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  confirm() {
    this.store$.dispatch(
      actions.approveOperationRequestSucceeded({
        operationRequest: this.operationRequest,
        signature: this.signatureControl?.value,
      })
    )
  }
}
