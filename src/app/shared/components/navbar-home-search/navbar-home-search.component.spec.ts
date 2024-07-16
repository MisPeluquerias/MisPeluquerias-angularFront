import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarHomeSearchComponent } from './navbar-home-search.component';

describe('NavbarHomeSearchComponent', () => {
  let component: NavbarHomeSearchComponent;
  let fixture: ComponentFixture<NavbarHomeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarHomeSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarHomeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
