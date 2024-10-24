import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  public usuario: any;

  constructor() { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
    //Realiza el get info para ver el tipo de cuenta
    await this.getInfoAndTipoCuenta();
  }

  async getInfoAndTipoCuenta() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const tipo_cuenta = this.usuario.tipo_usuario;

      if(tipo_cuenta == "0"){
        this.utilsSvc.routerLink('/main/owner');
      }else if(tipo_cuenta == "1"){
        this.utilsSvc.routerLink('/main/administrador');
      }else if(tipo_cuenta == "2"){
        this.utilsSvc.routerLink('/main/chofer');
      }else if(tipo_cuenta == "3"){
        this.utilsSvc.routerLink('/main/pasajero');
      }else{
        this.utilsSvc.presentToast({
          message: 'No se pudo reconocer los datos de tu cuenta. Informa a soporte por favor.',
          duration: 5000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo cargar el tipo de usuario',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }


  signOut() {
    this.firebaseSvc.signOut();
  }

}
