import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { HeaderItemComponent } from "./components/header-item/header-item.component";
import { MultiSignatureItemComponent } from "./components/multi-signature-item/multi-signature-item.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { SettingsComponent } from "./pages/settings/settings.component";

describe("AppComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        AppComponent,
        HeaderItemComponent,
        MultiSignatureItemComponent,
        SettingsComponent,
        DashboardComponent,
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'dapp-frontend'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual("dapp-frontend");
  });
});
