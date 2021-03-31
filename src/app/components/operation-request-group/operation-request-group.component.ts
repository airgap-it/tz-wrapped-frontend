import { OperationRequest } from '@airgap/beacon-sdk'
import { Component, Input, OnInit } from '@angular/core'
import { PagedResponse } from 'src/app/services/api/interfaces/common'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { OperationRequestKind } from 'src/app/services/api/interfaces/operationRequest'
import { User } from 'src/app/services/api/interfaces/user'

@Component({
  selector: 'operation-request-group',
  templateUrl: './operation-request-group.component.html',
  styleUrls: ['./operation-request-group.component.scss'],
})
export class OperationRequestGroupComponent implements OnInit {
  @Input()
  public name!: string

  @Input()
  public kind!: OperationRequestKind

  @Input()
  public openOperationRequestList!: PagedResponse<OperationRequest> | undefined

  @Input()
  public approvedOperationRequestList!:
    | PagedResponse<OperationRequest>
    | undefined

  @Input()
  public injectedOperationRequestList!:
    | PagedResponse<OperationRequest>
    | undefined

  constructor() {}

  ngOnInit(): void {}
}
