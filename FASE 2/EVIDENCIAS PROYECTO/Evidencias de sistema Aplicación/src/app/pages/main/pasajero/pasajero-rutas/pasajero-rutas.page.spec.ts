import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasajeroRutasPage } from './pasajero-rutas.page';

describe('PasajeroRutasPage', () => {
  let component: PasajeroRutasPage;
  let fixture: ComponentFixture<PasajeroRutasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasajeroRutasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
