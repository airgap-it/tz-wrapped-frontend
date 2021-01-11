import { Component, Input, OnInit } from '@angular/core'
import { UserWithApproval } from '../operation-request/operation-request.component'

@Component({
  selector: 'app-multi-signature-item',
  templateUrl: './multi-signature-item.component.html',
  styleUrls: ['./multi-signature-item.component.scss'],
})
export class MultiSignatureItemComponent implements OnInit {
  @Input()
  multisigItem: UserWithApproval | undefined

  constructor() {}

  ngOnInit(): void {}
}
