import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBusinessComponent } from './search-map-business.component';

describe('SearchBusinessComponent', () => {
  let component: SearchBusinessComponent;
  let fixture: ComponentFixture<SearchBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchBusinessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
