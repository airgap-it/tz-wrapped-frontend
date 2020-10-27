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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
