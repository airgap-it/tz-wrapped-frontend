import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../app.actions'

@Component({
  selector: 'app-header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss'],
})
export class HeaderItemComponent implements OnInit {
  public address$: Observable<string>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.address$ = this.store$.select((state) => state.app.address)
  }

  ngOnInit(): void {
    this.store$.dispatch(actions.loadAddress())
  }
}
