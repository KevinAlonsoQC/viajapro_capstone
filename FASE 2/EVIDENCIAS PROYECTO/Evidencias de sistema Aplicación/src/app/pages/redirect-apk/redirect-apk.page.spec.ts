import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedirectApkPage } from './redirect-apk.page';

describe('RedirectApkPage', () => {
  let component: RedirectApkPage;
  let fixture: ComponentFixture<RedirectApkPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectApkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
