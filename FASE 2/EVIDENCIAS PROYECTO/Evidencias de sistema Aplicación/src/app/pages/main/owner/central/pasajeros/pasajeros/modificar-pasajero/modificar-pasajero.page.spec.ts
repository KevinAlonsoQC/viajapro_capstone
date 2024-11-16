import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarPasajeroPage } from './modificar-pasajero.page';

describe('ModificarPasajeroPage', () => {
  let component: ModificarPasajeroPage;
  let fixture: ComponentFixture<ModificarPasajeroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarPasajeroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
