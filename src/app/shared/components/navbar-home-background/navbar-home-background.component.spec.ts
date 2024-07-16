import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarHomeBackgroundComponent } from './navbar-home-background.component';

describe('NavbarHomeBackgroundComponent', () => {
  let component: NavbarHomeBackgroundComponent;
  let fixture: ComponentFixture<NavbarHomeBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarHomeBackgroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarHomeBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
