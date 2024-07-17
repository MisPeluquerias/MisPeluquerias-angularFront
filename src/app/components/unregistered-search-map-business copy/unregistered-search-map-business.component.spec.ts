import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnRegisteredSearchBusinessComponent } from './unregistered-search-map-business.component';

describe('SearchBusinessComponent', () => {
  let component: UnRegisteredSearchBusinessComponent;
  let fixture: ComponentFixture<UnRegisteredSearchBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnRegisteredSearchBusinessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnRegisteredSearchBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
