import { Component, Input } from '@angular/core'
import { Approval, Operation, User } from 'src/app/services/api/api.service'

export interface UserWithApproval extends User {
  requestId: string
  isCurrentUser: boolean
  hasApproval: boolean
}

@Component({
  selector: 'app-open-minting-request',
  templateUrl: './open-minting-request.component.html',
  styleUrls: ['./open-minting-request.component.scss'],
})
export class OpenMintingRequestComponent {
  @Input()
  mintRequest: Operation | undefined

  @Input()
  users: User[] | undefined

  @Input()
  approvals: Approval[] | undefined

  @Input()
  address: string | undefined

  constructor() {}

  public multisigItems: UserWithApproval[] = []

  ngOnChanges(): void {
    console.log(this.mintRequest)
    console.log(this.users)
    console.log(this.approvals)
    console.log(this.address)

    if (!this.users) {
      throw new Error('Users not loaded')
    }

    if (!this.approvals) {
      throw new Error('Approvals not loaded')
    }

    if (!this.mintRequest) {
      throw new Error('Mint Request not loaded')
    }

    const mintRequest = this.mintRequest
    const approvals = this.approvals

    this.multisigItems = [
      ...this.users
        .filter((user) => user.kind === 'keyholder')
        .map((user) => ({
          ...user,
          requestId: mintRequest.id,
          isCurrentUser: user.address === this.address,
          hasApproval: approvals.some(
            (approval) => approval.approver.id === user.id
          ),
        })),
    ]
  }
}
