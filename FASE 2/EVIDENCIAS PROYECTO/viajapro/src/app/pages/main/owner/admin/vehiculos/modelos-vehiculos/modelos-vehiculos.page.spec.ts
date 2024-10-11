import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModelosVehiculosPage } from './modelos-vehiculos.page';

describe('ModelosVehiculosPage', () => {
  let component: ModelosVehiculosPage;
  let fixture: ComponentFixture<ModelosVehiculosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelosVehiculosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
