import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfesionalComponent } from './contact-profesional.component';

describe('ContactProfesionalComponent', () => {
  let component: ContactProfesionalComponent;
  let fixture: ComponentFixture<ContactProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactProfesionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
