import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarPresidentePage } from './modificar-presidente.page';

describe('ModificarPresidentePage', () => {
  let component: ModificarPresidentePage;
  let fixture: ComponentFixture<ModificarPresidentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarPresidentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
