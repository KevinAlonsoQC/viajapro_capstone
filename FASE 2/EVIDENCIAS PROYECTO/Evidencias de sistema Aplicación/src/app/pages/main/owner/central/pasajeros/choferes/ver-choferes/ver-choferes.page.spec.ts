import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerChoferesPage } from './ver-choferes.page';

describe('VerChoferesPage', () => {
  let component: VerChoferesPage;
  let fixture: ComponentFixture<VerChoferesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerChoferesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
