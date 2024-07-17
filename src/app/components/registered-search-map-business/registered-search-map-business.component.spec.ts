import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredSearchBusinessComponent } from './registered-search-map-business.component';

describe('SearchBusinessComponent', () => {
  let component: RegisteredSearchBusinessComponent;
  let fixture: ComponentFixture<RegisteredSearchBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisteredSearchBusinessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredSearchBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
