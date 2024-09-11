import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteSalonComponent } from './favorite-salon.component';

describe('FavoriteSalonComponent', () => {
  let component: FavoriteSalonComponent;
  let fixture: ComponentFixture<FavoriteSalonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FavoriteSalonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FavoriteSalonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
