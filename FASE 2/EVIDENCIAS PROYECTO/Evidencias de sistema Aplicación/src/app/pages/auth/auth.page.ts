import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  rememberMe: boolean = false;
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {
    // Si "Recordar usuario" está activado previamente, restaurar el correo desde el localStorage
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.form.controls['email'].setValue(savedEmail);
      this.rememberMe = true;
    }
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      const email = this.form.value.email!;
      const userStatusRef = this.firebaseSvc.firestore.collection('usuario');
      try {
        const snapshot = await userStatusRef.ref.where('email', '==', email).get();
        if (!snapshot.empty) {
          const userStatus = snapshot.docs[0].data();

          // Verificar si `isLoggedIn` existe y es true
          if (userStatus && userStatus['isLoggedIn'] && userStatus['tipo_usuario'] == '2' && userStatus['en_ruta'] == true) {
            this.utilsSvc.presentToast({
              message: 'Este usuario ya está iniciado y en ruta. Inténtalo más tarde.',
              duration: 3000,
              color: 'warning',
              position: 'middle',
              icon: 'alert-circle-outline',
            });
            loading.dismiss();
            return;
          }

          // Intentar iniciar sesión
          const res = await this.firebaseSvc.signIn(this.form.value as User);
          const uid = res.user.uid;
          const deviceID = await this.utilsSvc.getDeviceID();

          // Rastrear presencia con Firestore
          this.firebaseSvc.updateDocument(`usuario/${uid}`, { ...{ isLoggedIn: true, lastActive: Date.now(), dispositivo: deviceID } });
          if (userStatus && userStatus['tipo_usuario'] == '2') {
            const asientos = [true, true, true, true];
            for (let i = 0; i < asientos.length; i++) {
              const asientoKey = `asiento${i + 1}`;
              this.utilsSvc.saveInLocalStorage(asientoKey, true);
            }
            if (userStatus['en_ruta']) {
              if (userStatus['vehiculo_actual']) {
                this.firebaseSvc.updateDocument(`vehiculo/${userStatus['vehiculo_actual']}`, { ...{ en_ruta: false, chofer_actual: '', nombre_chofer: '', asientos_dispo_vehiculo: 4, ruta_actual: false, token: '', rut_chofer: '' } });
              }
              this.firebaseSvc.updateDocument(`usuario/${uid}`, { ...{ en_ruta: false, vehiculo_actual: '' } });
            }

          }

          // Obtener información del usuario
          this.getUserInfo(uid);

          // Si el usuario ha seleccionado "Recordar usuario", guardar el correo en localStorage
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail'); // Si no se marca, eliminar del almacenamiento
          }
        } else {
          this.utilsSvc.presentToast({
            message: 'Este correo no está registrado.',
            duration: 2500,
            position: 'middle',
            icon: 'close-circle-outline',
            cssClass: 'toast-error',
          });
        }
      } catch (error) {
        console.error(error);
        this.utilsSvc.presentToast({
          message: 'Ocurrió un error al intentar iniciar sesión. '+error,
          duration: 2500,
          position: 'middle',
          icon: 'close-circle-outline',
          cssClass: 'toast-error',
        });
      } finally {
        loading.dismiss();
      }
    }
  }


  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      const path = `usuario/${uid}`;

      this.firebaseSvc.getDocument(path).then((user: User) => {
        this.utilsSvc.saveInLocalStorage('usuario', user);
        this.utilsSvc.routerLink('/main');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: 'Has ingresado correctamente',
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        });

      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
          message: 'Las credenciales son incorrectas',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      }).finally(() => {
        loading.dismiss();
      });
    }
  }

}
