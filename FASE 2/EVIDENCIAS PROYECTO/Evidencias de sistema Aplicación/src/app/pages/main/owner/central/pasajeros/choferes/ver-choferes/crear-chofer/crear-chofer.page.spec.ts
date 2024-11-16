import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearChoferPage } from './crear-chofer.page';

describe('CrearChoferPage', () => {
  let component: CrearChoferPage;
  let fixture: ComponentFixture<CrearChoferPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearChoferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
