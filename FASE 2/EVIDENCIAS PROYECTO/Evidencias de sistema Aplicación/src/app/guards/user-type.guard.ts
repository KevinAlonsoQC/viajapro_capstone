import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class UserTypeGuard implements CanActivate {

  constructor(
    private utilsSvc: UtilsService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const userFromStorage = this.utilsSvc.getFromLocalStorage('usuario');

    // Si no hay usuario en el localStorage, redirige al login o página de inicio
    if (!userFromStorage) {
      this.router.navigate(['/login']);
      return false;
    }

    const tipoCuenta = userFromStorage?.tipo_usuario;

    // Verifica si el usuario ya está en la ruta correspondiente
    if (this.router.url.includes('owner') && tipoCuenta === "0") {
      return true;
    } else if (this.router.url.includes('administrador') && tipoCuenta === "1") {
      return true;
    } else if (this.router.url.includes('chofer') && tipoCuenta === "2") {
      return true;
    } else if (this.router.url.includes('pasajero') && tipoCuenta === "3") {
      return true;
    }

    // Redirige según el tipo de cuenta
    switch (tipoCuenta) {
      case "0":
        this.router.navigate(['/main/owner']);
        break;
      case "1":
        this.router.navigate(['/main/administrador']);
        break;
      case "2":
        this.router.navigate(['/main/chofer']);
        break;
      case "3":
        this.router.navigate(['/main/pasajero']);
        break;
      default:
        this.utilsSvc.presentToast({
          message: 'No se pudo reconocer los datos de tu cuenta. Informa a soporte por favor.',
          duration: 5000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        this.router.navigate(['/login']);
        return false;
    }

    // Si todo va bien, permitimos el acceso
    return true;
  }
}
