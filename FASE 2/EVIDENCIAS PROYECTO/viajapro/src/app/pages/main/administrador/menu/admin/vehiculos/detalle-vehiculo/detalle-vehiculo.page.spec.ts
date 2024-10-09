import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleVehiculoPage } from './detalle-vehiculo.page';

describe('DetalleVehiculoPage', () => {
  let component: DetalleVehiculoPage;
  let fixture: ComponentFixture<DetalleVehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleVehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
