import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { StoreModule } from '@ngrx/store'
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
import { OpenMintingRequestComponent } from './components/open-minting-request/open-minting-request.component'
import { ShortenPipe } from './shorten.pipe'

export const rpcURLMainnet = 'https://tezos-node.prod.gke.papers.tech'
export const rpcURLDelphinet = 'https://delphinet-tezos.giganode.io'
@NgModule({
  declarations: [
    AppComponent,
    HeaderItemComponent,
    MultiSignatureItemComponent,
    SettingsComponent,
    DashboardComponent,
    OpenMintingRequestComponent,
    ShortenPipe,
  ],
  imports: [
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    BrowserModule,
    CommonModule,
    TabsModule.forRoot(),
    AppRoutingModule,
    StoreModule.forRoot({}, {}),
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
  providers: [BeaconService],
  bootstrap: [AppComponent],
})
export class AppModule {}
