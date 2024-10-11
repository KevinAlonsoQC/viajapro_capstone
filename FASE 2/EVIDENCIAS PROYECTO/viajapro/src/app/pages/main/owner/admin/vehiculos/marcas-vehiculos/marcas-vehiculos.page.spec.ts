import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarcasVehiculosPage } from './marcas-vehiculos.page';

describe('MarcasVehiculosPage', () => {
  let component: MarcasVehiculosPage;
  let fixture: ComponentFixture<MarcasVehiculosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcasVehiculosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
