import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonReclamationComponent } from './salon-reclamation.component';

describe('SalonReclamationComponent', () => {
  let component: SalonReclamationComponent;
  let fixture: ComponentFixture<SalonReclamationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalonReclamationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalonReclamationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
