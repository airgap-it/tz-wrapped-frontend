import { Component, Input, OnInit } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { SignableMessageInfo } from 'src/app/services/api/interfaces/common'
import { CopyService } from 'src/app/services/copy/copy-service.service'

@Component({
  selector: 'app-modal-item',
  templateUrl: './modal-item.component.html',
  styleUrls: ['./modal-item.component.scss'],
})
export class ModalItemComponent implements OnInit {
  @Input()
  signableMessage!: SignableMessageInfo

  constructor(
    public bsModalRef: BsModalRef,
    private readonly copyService: CopyService
  ) {}

  ngOnInit(): void {}

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }
}
