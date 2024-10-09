import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunasPage } from './comunas.page';

describe('ComunasPage', () => {
  let component: ComunasPage;
  let fixture: ComponentFixture<ComunasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
