import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarChoferPage } from './modificar-chofer.page';

describe('ModificarChoferPage', () => {
  let component: ModificarChoferPage;
  let fixture: ComponentFixture<ModificarChoferPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarChoferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
