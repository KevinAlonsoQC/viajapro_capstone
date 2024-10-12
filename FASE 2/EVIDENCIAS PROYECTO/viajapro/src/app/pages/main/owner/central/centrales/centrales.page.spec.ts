import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CentralesPage } from './centrales.page';

describe('CentralesPage', () => {
  let component: CentralesPage;
  let fixture: ComponentFixture<CentralesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
