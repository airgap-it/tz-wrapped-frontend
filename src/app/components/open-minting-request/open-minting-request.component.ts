import { Component, Input } from '@angular/core'
import {
  ApiService,
  Approval,
  Operation,
  User,
} from 'src/app/services/api/api.service'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../app.actions'
import { Store } from '@ngrx/store'

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

  approvals: Approval[] | undefined

  @Input()
  address: string | undefined

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly apiService: ApiService
  ) {}

  public currentConfirmations: number = 0
  public maxConfirmations: number = 3

  @Input()
  public currentUserType: 'keyholder' | 'gatekeeper' | undefined
  public currentUserApproved: boolean = false
  public multisigItems: UserWithApproval[] = []

  private hasRequestedApprovals: boolean = false

  async ngOnChanges(): Promise<void> {
    // console.log(this.mintRequest)
    // console.log(this.users)
    // console.log(this.approvals)
    // console.log(this.address)

    if (!this.users) {
      throw new Error('Users not loaded')
    }

    this.maxConfirmations = this.users.filter(
      (user) => user.kind === 'keyholder'
    ).length

    if (!this.mintRequest) {
      throw new Error('Mint Request not loaded')
    }

    this.mintRequest = {
      // TODO: Temporary workaround, remove after demo
      ...this.mintRequest,
      requester: {
        ...this.mintRequest.requester,
        display_name:
          this.mintRequest.requester.display_name === 'Ugly Release'
            ? 'Bitcoin Suisse'
            : this.mintRequest.requester.display_name,
      },
    }

    const mintRequest = this.mintRequest

    if (!this.hasRequestedApprovals) {
      this.hasRequestedApprovals = true

      // TODO: This is a workaround. We should probably use the global store
      this.approvals = (
        await this.apiService.getApprovals(mintRequest.id).toPromise()
      ).results
      console.log('approvals', this.approvals)
      this.currentConfirmations = this.approvals.length
    }

    if (!this.approvals) {
      throw new Error('Approvals not loaded')
    }

    const approvals = this.approvals.filter(
      (approval) => approval.request_id === mintRequest.id
    )

    this.currentUserApproved = approvals.some(
      (approval) => approval.approver.address === this.address
    )

    this.multisigItems = [
      ...this.users
        .filter((user) => user.kind === 'keyholder')
        .map((user) => ({
          ...user,
          display_name:
            user.display_name === 'Ugly Release'
              ? 'Bitcoin Suisse'
              : user.display_name,
          requestId: mintRequest.id,
          isCurrentUser: user.address === this.address,
          hasApproval: approvals.some(
            (approval) => approval.approver.id === user.id
          ),
          updated_at:
            approvals.find((approval) => approval.approver.id === user.id)
              ?.created_at ?? '',
        })),
    ]
  }

  public submitApprovedMint() {
    if (this.mintRequest) {
      const requestId = this.mintRequest.id
      this.store$.dispatch(
        actions.getApprovedMintParameters({
          operationId: requestId,
        })
      )
    }
  }

  public confirmRequest() {
    if (this.mintRequest) {
      this.store$.dispatch(
        actions.requestApproveMintOperation({
          requestId: this.mintRequest.id,
        })
      )
    }
  }
}
