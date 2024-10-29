import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsientosPage } from './asientos.page';

describe('AsientosPage', () => {
  let component: AsientosPage;
  let fixture: ComponentFixture<AsientosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsientosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
