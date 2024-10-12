import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleCentralPage } from './detalle-central.page';

describe('DetalleCentralPage', () => {
  let component: DetalleCentralPage;
  let fixture: ComponentFixture<DetalleCentralPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleCentralPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
