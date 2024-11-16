import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isMobile = this.detectMobile();

    if (!isMobile) {
      // Redirige a la vista web
      if (state.url !== '/redirect-apk') {
        this.router.navigate(['/redirect-apk']);
        return false;
      }
    }

    return true;  // Permite el acceso si no es necesario redirigir
  }

  private detectMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || window['opera'];
    return /android|iPad|iPhone|iPod/i.test(userAgent);
  }
}
