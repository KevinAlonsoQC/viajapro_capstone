import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerRutasPage } from './ver-rutas.page';

describe('VerRutasPage', () => {
  let component: VerRutasPage;
  let fixture: ComponentFixture<VerRutasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerRutasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
