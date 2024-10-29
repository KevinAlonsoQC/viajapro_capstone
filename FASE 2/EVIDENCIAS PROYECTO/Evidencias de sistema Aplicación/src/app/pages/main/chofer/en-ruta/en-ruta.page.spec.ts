import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnRutaPage } from './en-ruta.page';

describe('EnRutaPage', () => {
  let component: EnRutaPage;
  let fixture: ComponentFixture<EnRutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnRutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
