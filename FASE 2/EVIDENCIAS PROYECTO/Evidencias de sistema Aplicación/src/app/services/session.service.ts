import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private firebaseSvc = inject(FirebaseService);
  private utilsSvc = inject(UtilsService);

  private inactivityTimeout: any;
  private confirmationTimeout: any;
  private inactivityDuration = 20 * 60 * 1000; // 20 minutos
  private confirmationDuration = 60 * 1000; // 1 minuto para responder

  private sessionTimeout: any;
  private confirmationSessionTimeout: any;
  private verificationDuration = 5000; // 5 segundos
  private waitDuration = 10000; // 10 segundos para responder

  private usuario: any;
  constructor(private alertController: AlertController) {
    this.initSessionMonitoring();
  }

  /**
   * Inicializa el monitoreo de sesión.
   */
  initSessionMonitoring() {
    this.startInactivityTracking();
  }

  /**
   * Rastrea la actividad del usuario.
   */
  private startInactivityTracking() {
    this.resetInactivityTimer();
    this.resetTimerSession();

    // Detectar eventos de actividad en todas las páginas
    const activityEvents = ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.resetInactivityTimer()
        this.resetTimerSession();
      }
      );
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

  private resetTimerSession() {
    clearTimeout(this.sessionTimeout);
    clearTimeout(this.confirmationSessionTimeout);

    // Configurar el temporizador de inactividad
    this.sessionTimeout = setTimeout(() => {
      this.showAlertSession();
    }, this.verificationDuration);
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
      this.resetInactivityTimer();
    }
  }

  private async showAlertSession() {
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });
    if (this.usuario) {
      const getUser = await this.firebaseSvc.getDocument(`usuario/${this.usuario.uid}`);
      const device = await this.utilsSvc.itsThisDevice(getUser['dispositivo']);
      if (!device) {
        const alert = await this.alertController.create({
          header: 'Lo sentimos :(',
          message: 'Se ha iniciado sesión en otro dispositivo.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                clearTimeout(this.sessionTimeout);
                clearTimeout(this.confirmationSessionTimeout);
                this.firebaseSvc.signOut(); // Si responde, reinicia el temporizador
              },
            },
          ],
        });

        await alert.present();

        // Configurar cierre automático si no responde
        this.confirmationSessionTimeout = setTimeout(() => {
          alert.dismiss();
          clearTimeout(this.sessionTimeout);
          clearTimeout(this.confirmationSessionTimeout);

          this.firebaseSvc.signOut();
        }, this.waitDuration);
      } else {
        this.resetTimerSession();
      }
    } else {
      console.log('No hay usuario')
      clearTimeout(this.sessionTimeout);
      clearTimeout(this.confirmationSessionTimeout);
    }
  }

  /**
   * Finaliza el Servicio del Chofer.
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

      if (this.usuario.en_ruta) {
        this.firebaseSvc.updateDocument(`vehiculo/${this.usuario.vehiculo_actual}`, { ...{ en_ruta: false, chofer_actual: '', nombre_chofer: '', asientos_dispo_vehiculo: 4, ruta_actual: false, token: '', rut_chofer: '' } });
      }

      this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: false, vehiculo_actual: '' } });

      this.usuario.en_ruta = false;
      this.usuario.vehiculo_actual = '';
      this.utilsSvc.saveInLocalStorage('usuario', this.usuario);
    }
  }
}
