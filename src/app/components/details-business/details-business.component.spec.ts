import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsBusinessComponent } from './details-business.component';

describe('DetailsBusinessComponent', () => {
  let component: DetailsBusinessComponent;
  let fixture: ComponentFixture<DetailsBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsBusinessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailsBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
