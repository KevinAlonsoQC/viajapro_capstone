import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresidentesPage } from './presidentes.page';

describe('PresidentesPage', () => {
  let component: PresidentesPage;
  let fixture: ComponentFixture<PresidentesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PresidentesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
