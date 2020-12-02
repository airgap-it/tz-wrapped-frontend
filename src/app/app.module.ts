import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { TabsModule } from "ngx-bootstrap/tabs";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { StoreModule } from "@ngrx/store";
import { HeaderItemComponent } from "./components/header-item/header-item.component";
import { MultiSignatureItemComponent } from "./components/multi-signature-item/multi-signature-item.component";
import { SettingsComponent } from "./pages/settings/settings.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { BeaconService } from "./services/beacon/beacon.service";
import { EffectsModule } from "@ngrx/effects";
import { AppEffects } from "./app.effects";
import { metaReducers, ROOT_REDUCERS } from "./reducers";

@NgModule({
  declarations: [
    AppComponent,
    HeaderItemComponent,
    MultiSignatureItemComponent,
    SettingsComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    BrowserModule,
    TabsModule.forRoot(),
    AppRoutingModule,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([AppEffects]),
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: false, // true is default (see comment in baker-table)
      },
    }),
  ],
  providers: [BeaconService],
  bootstrap: [AppComponent],
})
export class AppModule {}
