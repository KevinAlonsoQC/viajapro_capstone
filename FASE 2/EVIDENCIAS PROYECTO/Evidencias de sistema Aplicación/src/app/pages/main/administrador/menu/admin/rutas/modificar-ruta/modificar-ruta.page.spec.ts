import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarRutaPage } from './modificar-ruta.page';

describe('ModificarRutaPage', () => {
  let component: ModificarRutaPage;
  let fixture: ComponentFixture<ModificarRutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarRutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
