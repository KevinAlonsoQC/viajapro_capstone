import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CentralColectivo } from 'src/app/models/central-colectivo';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.page.html',
  styleUrls: ['./conductores.page.scss'],
})
export class ConductoresPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  choferes!: any;
  central!: CentralColectivo;

  elementosFiltrados: any[] = [];  // Lista filtrada
  searchText: string = '';  // Texto de búsqueda

  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getChoferes();
  }

  async getChoferes() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const usuarioPath = 'usuario'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [usuarios] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.choferes = usuarios.filter(usuario =>
        usuario.central == this.usuario.central && usuario.tipo_usuario == '2'
      );

      this.elementosFiltrados = this.choferes; //Copiamos desde la variable

      if (this.choferes.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Conductores Cargados con Éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No hay choferes disponibles',
          duration: 1500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

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

  modificarConductor(id: string) {
    this.router.navigate(['/main/administrador/admin/conductores/modificar-conductor', id]);
  }

  crearConductor() {
    this.utilsSvc.routerLink('/main/administrador/admin/conductores/crear-conductor');
  }

  async eliminarConductor(id: string, rut: string) {
    const alert = await this.alertController.create({
      header: '¿Seguro de Eliminar al Conductor?',
      subHeader: `Se eliminará al Conductor con RUT: ${rut}`,
      message: 'Recuerda que si aceptas, esta opción es irreversible.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.utilsSvc.presentToast({
              message: 'Cancelaste la acción',
              duration: 1500,
              color: 'primary',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
          },
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              // Elimina el documento de Firebase
              await this.firebaseSvc.deleteDocument(`usuario/${id}`);

              this.utilsSvc.presentToast({
                message: `Has eliminado al Conductor con RUT ${rut}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getChoferes();
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al eliminar al Conductor con RUT ${rut}. Inténtalo de nuevo.`,
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline',
              });
            } finally {
              loading.dismiss();
            }
          }
        },
      ],
    });

    await alert.present();
  }
  // Función para filtrar
  filtrar(event: any) {
    const textoBusqueda = event.target.value.toLowerCase();  // Captura el valor ingresado y lo convierte a minúsculas

    // Filtrar los choferes por nombre o rut
    if (textoBusqueda.trim() === '') {
      // Si no hay texto de búsqueda, mostrar todos los choferes
      this.elementosFiltrados = this.choferes;
    } else {
      this.elementosFiltrados = this.choferes.filter(chofer =>
        chofer.name.toLowerCase().includes(textoBusqueda) ||
        chofer.rut_usuario.toLowerCase().includes(textoBusqueda)
      );
    }
  }

}
