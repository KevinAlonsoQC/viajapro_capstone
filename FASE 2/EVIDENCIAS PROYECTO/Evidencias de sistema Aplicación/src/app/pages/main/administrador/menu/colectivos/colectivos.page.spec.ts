import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColectivosPage } from './colectivos.page';

describe('ColectivosPage', () => {
  let component: ColectivosPage;
  let fixture: ComponentFixture<ColectivosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ColectivosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
