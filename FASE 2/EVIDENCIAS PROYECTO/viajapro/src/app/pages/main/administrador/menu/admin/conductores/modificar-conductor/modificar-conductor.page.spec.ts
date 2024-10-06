import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarConductorPage } from './modificar-conductor.page';

describe('ModificarConductorPage', () => {
  let component: ModificarConductorPage;
  let fixture: ComponentFixture<ModificarConductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
