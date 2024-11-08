import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerVehiculosPage } from './ver-vehiculos.page';

describe('VerVehiculosPage', () => {
  let component: VerVehiculosPage;
  let fixture: ComponentFixture<VerVehiculosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerVehiculosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
