import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-en-ruta',
  templateUrl: './en-ruta.page.html',
  styleUrls: ['./en-ruta.page.scss'],
})
export class EnRutaPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  vehiculos: any;
  rutas: any;

  constructor(private router: Router) { }


  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
    await this.getData();
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'vehiculo'; // Ruta de la colección de usuarios
    const urlPath2 = 'ruta_central'; // Ruta de la colección de usuarios


    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback2] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any[]>

      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
			this.rutas = callback2.filter(ruta =>
				ruta.central == this.usuario.central
			);
      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.vehiculos = callback.filter(veh => {
        return veh.central == this.usuario.central && this.usuario.uid == veh.chofer_actual && veh.en_ruta == true
      });
  
      if (this.vehiculos.length <= 0) {
        this.utilsSvc.presentToast({
          message: '¡No hay Vehículos Asignados para ti!',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, {...{en_ruta:false,  vehiculo_actual:''}});
        this.utilsSvc.routerLink('/main/chofer');
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos  prometidos:(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  viewRuta(ruta: any){
		this.router.navigate(['/main/chofer/ver-ruta', ruta.id]);
  }

}
