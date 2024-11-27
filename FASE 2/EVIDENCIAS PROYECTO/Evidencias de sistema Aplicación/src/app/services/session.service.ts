import { Injectable, inject, HostListener } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private firebaseSvc = inject(FirebaseService);
  private utilsSvc = inject(UtilsService);
  private platform = inject(Platform);

  private inactivityTimeout: any;
  private confirmationTimeout: any;
  private inactivityDuration = 20 * 60 * 1000; // 20 minutos
  private confirmationDuration = 60 * 1000; // 1 minuto para responder

  private usuario: any;
  constructor(private alertController: AlertController) {
    this.initSessionMonitoring();
    this.detectAppClose();
  }

  // Detectar cierre de la app en dispositivos móviles
  private detectAppClose() {
    App.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        console.log('App')
        this.logoutService();
      }
    });
  }

  /**
   * Inicializa el monitoreo de sesión.
   */
  initSessionMonitoring() {
    this.startInactivityTracking();
    this.handleAppLifecycle();
  }

  /**
   * Rastrea la actividad del usuario.
   */
  private startInactivityTracking() {
    this.resetInactivityTimer();

    // Detectar eventos de actividad en todas las páginas
    const activityEvents = ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  /**
   * Maneja los estados de pausa y reanudación de la aplicación.
   */
  private handleAppLifecycle() {
    this.platform.pause.subscribe(() => {
      // Si la app se va a segundo plano, cerrar sesión.
      this.logoutService();
    });

    this.platform.resume.subscribe(() => {
      // Cuando la app vuelve al primer plano, reinicia el temporizador.
      this.resetInactivityTimer();
    });
  }

  /**
   * Reinicia el temporizador de inactividad.
   */
  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    clearTimeout(this.confirmationTimeout);

    // Configurar el temporizador de inactividad
    this.inactivityTimeout = setTimeout(() => {
      this.showInactivityPrompt();
    }, this.inactivityDuration);
  }

  /**
   * Muestra un mensaje de confirmación de actividad.
   */
  private async showInactivityPrompt() {
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });
    if (this.usuario.en_ruta) {
      const alert = await this.alertController.create({
        header: '¿Sigues ahí?',
        message: 'Se finalizará tu servicio en 1 minuto si no respondes.',
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              this.resetInactivityTimer(); // Si responde, reinicia el temporizador
            },
          },
          {
            text: 'Finalizar Servicio',
            role: 'cancel',
            handler: () => {
              this.logoutService();
            },
          },
        ],
      });

      await alert.present();

      // Configurar cierre automático si no responde
      this.confirmationTimeout = setTimeout(() => {
        alert.dismiss();
        this.logoutService();
      }, this.confirmationDuration);
    } else {
      console.log('No está en ruta!')
      this.resetInactivityTimer();
    }
  }

  /**
   * Cierra la sesión del usuario.
   */
  private async logoutService() {
    clearTimeout(this.inactivityTimeout);
    clearTimeout(this.confirmationTimeout);

    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });


    if (this.usuario.tipo_usuario == '2') {
      const asientos = [true, true, true, true];
      for (let i = 0; i < asientos.length; i++) {
        const asientoKey = `asiento${i + 1}`;
        this.utilsSvc.saveInLocalStorage(asientoKey, true);
      }

      if(this.usuario.en_ruta){
        this.firebaseSvc.updateDocument(`vehiculo/${this.usuario.vehiculo_actual}`, { ...{ en_ruta: false, chofer_actual: '', nombre_chofer: '', asientos_dispo_vehiculo: 4, ruta_actual: false, token: '', rut_chofer: '' } });
      }

      this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: false, vehiculo_actual: '', isLoggedIn: false, lastActive: Date.now() } });

      this.usuario.en_ruta = false;
      this.usuario.vehiculo_actual = '';
      this.utilsSvc.saveInLocalStorage('usuario', this.usuario);
    }
  }
}
