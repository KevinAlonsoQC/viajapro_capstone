import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-redirect-apk',
  templateUrl: './redirect-apk.page.html',
  styleUrls: ['./redirect-apk.page.scss'],
})
export class RedirectApkPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: any;

  link: any;
  constructor() { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getData();
    if (this.usuario.tipo_usuario == '2') {
      const asientos = [true, true, true, true];
      for (let i = 0; i < asientos.length; i++) {
        const asientoKey = `asiento${i + 1}`;
        this.utilsSvc.saveInLocalStorage(asientoKey, true);
      }

      const [veh] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments('vehiculo') as Promise<any>
      ]);
      const vehRuta = veh.filter(veh => {
        return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
      });
      if (vehRuta.length > 0) {
        await this.firebaseSvc.updateDocument(`vehiculo/${vehRuta.id}`, { ...{ en_ruta: false, chofer_actual: '', nombre_chofer: '', asientos_dispo_vehiculo: 4, ruta_actual: false, token: '', rut_chofer: '' } });
        await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, { ...{ en_ruta: false, vehiculo_actual: '' } });
        this.usuario.en_ruta = false;
        this.usuario.vehiculo_actual = '';
        this.utilsSvc.saveInLocalStorage('usuario', this.usuario);
      }
    }

    this.firebaseSvc.signOutNotRedirect();
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'link'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [descargable] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>
      ]);

      this.link = descargable[0];
      console.log(this.link)

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  auth(){
    this.utilsSvc.routerLink('/welcome')
  }
}
