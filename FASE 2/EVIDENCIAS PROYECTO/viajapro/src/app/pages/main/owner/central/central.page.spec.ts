import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CentralPage } from './central.page';

describe('CentralPage', () => {
  let component: CentralPage;
  let fixture: ComponentFixture<CentralPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
