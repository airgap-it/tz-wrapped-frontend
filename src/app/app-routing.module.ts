import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { SettingsComponent } from './pages/settings/settings.component'

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
