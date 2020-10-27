import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSignatureItemComponent } from './multi-signature-item.component';

describe('MultiSignatureItemComponent', () => {
  let component: MultiSignatureItemComponent;
  let fixture: ComponentFixture<MultiSignatureItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiSignatureItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSignatureItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
