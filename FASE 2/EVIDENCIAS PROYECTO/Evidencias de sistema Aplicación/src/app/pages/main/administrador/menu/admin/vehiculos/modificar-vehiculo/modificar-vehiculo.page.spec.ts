import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarVehiculoPage } from './modificar-vehiculo.page';

describe('ModificarVehiculoPage', () => {
  let component: ModificarVehiculoPage;
  let fixture: ComponentFixture<ModificarVehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarVehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
