import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProvinciasPage } from './provincias.page';

describe('ProvinciasPage', () => {
  let component: ProvinciasPage;
  let fixture: ComponentFixture<ProvinciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvinciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
