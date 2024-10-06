import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearConductorPage } from './crear-conductor.page';

describe('CrearConductorPage', () => {
  let component: CrearConductorPage;
  let fixture: ComponentFixture<CrearConductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
