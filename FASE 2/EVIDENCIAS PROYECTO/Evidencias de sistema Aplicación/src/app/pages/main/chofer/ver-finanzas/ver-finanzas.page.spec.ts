import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerFinanzasPage } from './ver-finanzas.page';

describe('VerFinanzasPage', () => {
  let component: VerFinanzasPage;
  let fixture: ComponentFixture<VerFinanzasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerFinanzasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
