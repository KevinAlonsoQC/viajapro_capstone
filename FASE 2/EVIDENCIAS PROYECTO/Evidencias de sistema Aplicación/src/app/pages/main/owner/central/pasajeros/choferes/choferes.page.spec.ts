import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoferesPage } from './choferes.page';

describe('ChoferesPage', () => {
  let component: ChoferesPage;
  let fixture: ComponentFixture<ChoferesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoferesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
