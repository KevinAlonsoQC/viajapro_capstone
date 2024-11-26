import { AlertController, Platform } from '@ionic/angular';
import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private firebaseSvc = inject(FirebaseService);
  private utilsSvc = inject(UtilsService);
  private platform = inject(Platform);

  private inactivityTimeout: any;
  private confirmationTimeout: any;

  constructor(private alertController: AlertController) { 
    this.startInactivityTracking();
    this.handleAppLifecycle();
  }

  // Inicia el rastreo de actividad
  startInactivityTracking() {
    this.resetInactivityTimer();

    // Detectar actividad del usuario
    ['click', 'mousemove', 'keydown', 'touchstart'].forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  // Manejar el ciclo de vida de la app (pausa y reanudación)
  private handleAppLifecycle() {
    this.platform.pause.subscribe(() => {
      // Usuario ha dejado la app en segundo plano
      this.logoutUser();
    });

    this.platform.resume.subscribe(() => {
      // Usuario ha vuelto a la app
      this.resetInactivityTimer();
    });
  }

  // Reinicia el temporizador de inactividad
  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);

    // Cada 30 minutos, muestra la confirmación de actividad
    this.inactivityTimeout = setTimeout(() => {
      this.showInactivityPrompt();
    }, 5000); // 30 minutos
  }

  // Muestra el mensaje de confirmación
  private async showInactivityPrompt() {
    const confirm = await this.alertController.create({
      header: '¿Sigues ahí?',
      message: 'Confirma si deseas continuar usando la aplicación.',
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.resetInactivityTimer(); // Si responde, reinicia el temporizador
          },
        },
        {
          text: 'Cerrar sesión',
          role: 'cancel',
          handler: () => {
            this.logoutUser(); // Si elige cerrar sesión
          },
        },
      ],
    });

    // Si no responde en 1 minuto, cerrar sesión automáticamente
    this.confirmationTimeout = setTimeout(() => {
      if (!confirm) {
        this.logoutUser();
      }
    }, 60 * 1000); // 1 minuto
  }

  // Cerrar sesión del usuario
  private async logoutUser() {
    clearTimeout(this.inactivityTimeout);
    clearTimeout(this.confirmationTimeout);

    const user = this.firebaseSvc.getAuth().currentUser;
    if (user) {
      await this.firebaseSvc.updateDocument(`usuario/${user.uid}`, {
        isLoggedIn: false,
        lastActive: Date.now(),
      });
    }
    this.firebaseSvc.signOut();
  }
}
