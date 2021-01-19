import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { Store, StoreModule } from '@ngrx/store'
import { HeaderItemComponent } from './components/header-item/header-item.component'
import { MultiSignatureItemComponent } from './components/multi-signature-item/multi-signature-item.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { BeaconService } from './services/beacon/beacon.service'
import { EffectsModule } from '@ngrx/effects'
import { AppEffects } from './app.effects'
import { metaReducers, ROOT_REDUCERS } from './reducers'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { OperationRequestComponent } from './components/operation-request/operation-request.component'
import { ModalItemComponent } from './components/modal-item/modal-item.component'
import { AmountConverterPipe } from './pipes/amount.pipe'
import { ShortenPipe } from './pipes/shorten.pipe'

@NgModule({
  declarations: [
    AppComponent,
    HeaderItemComponent,
    MultiSignatureItemComponent,
    SettingsComponent,
    DashboardComponent,
    OperationRequestComponent,
    ShortenPipe,
    ModalItemComponent,
    AmountConverterPipe,
  ],
  imports: [
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    BrowserModule,
    CommonModule,
    TabsModule.forRoot(),
    AppRoutingModule,
    EffectsModule.forRoot([AppEffects]),
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [BeaconService, Store],
  bootstrap: [AppComponent],
})
export class AppModule {}
