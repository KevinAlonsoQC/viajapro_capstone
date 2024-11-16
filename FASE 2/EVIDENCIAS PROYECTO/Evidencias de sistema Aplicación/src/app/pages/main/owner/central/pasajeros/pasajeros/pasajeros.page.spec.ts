import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasajerosPage } from './pasajeros.page';

describe('PasajerosPage', () => {
  let component: PasajerosPage;
  let fixture: ComponentFixture<PasajerosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasajerosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
