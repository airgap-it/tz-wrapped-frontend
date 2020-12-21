import { Component, Input, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { UserWithApproval } from '../open-minting-request/open-minting-request.component'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../app.actions'

@Component({
  selector: 'app-multi-signature-item',
  templateUrl: './multi-signature-item.component.html',
  styleUrls: ['./multi-signature-item.component.scss'],
})
export class MultiSignatureItemComponent implements OnInit {
  @Input()
  multisigItem: UserWithApproval | undefined

  constructor(private readonly store$: Store<fromRoot.State>) {}

  ngOnInit(): void {}

  approve(): void {
    if (this.multisigItem) {
      this.store$.dispatch(
        actions.requestApproveMintOperation({
          requestId: this.multisigItem.requestId,
        })
      )
    }
  }
}
