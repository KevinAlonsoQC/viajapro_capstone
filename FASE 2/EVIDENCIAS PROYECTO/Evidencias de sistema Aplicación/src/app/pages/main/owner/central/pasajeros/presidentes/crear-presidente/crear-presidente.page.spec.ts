import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPresidentePage } from './crear-presidente.page';

describe('CrearPresidentePage', () => {
  let component: CrearPresidentePage;
  let fixture: ComponentFixture<CrearPresidentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPresidentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
