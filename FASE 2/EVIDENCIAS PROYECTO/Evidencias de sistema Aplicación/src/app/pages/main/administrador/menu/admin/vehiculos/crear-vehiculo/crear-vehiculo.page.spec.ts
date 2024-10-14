import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearVehiculoPage } from './crear-vehiculo.page';

describe('CrearVehiculoPage', () => {
  let component: CrearVehiculoPage;
  let fixture: ComponentFixture<CrearVehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearVehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
