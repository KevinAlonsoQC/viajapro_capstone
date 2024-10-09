import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaisesPage } from './paises.page';

describe('PaisesPage', () => {
  let component: PaisesPage;
  let fixture: ComponentFixture<PaisesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaisesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
