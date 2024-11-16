import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CentralColectivo } from 'src/app/models/central-colectivo';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-presidentes',
  templateUrl: './presidentes.page.html',
  styleUrls: ['./presidentes.page.scss'],
})
export class PresidentesPage implements OnInit {


  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  presidentes!: any;
  central!: any;
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
    await this.getData();
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const usuarioPath = 'usuario'; // Ruta de la colección de usuarios
    const usuarioPath2 = 'central_colectivo'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [usuarios, central] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]>,
        this.firebaseSvc.getCollectionDocuments(usuarioPath2) as Promise<any[]>
      ]);

      // Asegurarnos de que central tiene la estructura correcta
      this.central = central[0]; // Si central es un array, tomar el primer elemento (ajusta si es necesario)

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.presidentes = usuarios.filter(usuario => {
        // Comprobar si el tipo de usuario es '1' (por ejemplo, choferes)
        return usuario.tipo_usuario === '1';
      }).map(usuario => {
        // Verificar si el id de la central del usuario coincide con el id de la central seleccionada
        if (usuario.central === this.central.id) {
          // Si coinciden, agregar el nombre de la central al objeto del presidente
          usuario.nombre_central = this.central.nombre_central;  // Asegúrate de que `this.central.nombre_central` tiene el nombre correcto
        }
        return usuario;
      });

      this.elementosFiltrados = this.presidentes; //Copiamos desde la variable

      if (this.presidentes.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Conductores Cargados con Éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No hay Presidentes Creados',
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


  modificarPresidente(id: string) {
    this.router.navigate(['/main/owner/central/pasajeros/presidentes/modificar-presidente', id]);
  }

  crearPresidente() {
    this.utilsSvc.routerLink('/main/owner/central/pasajeros/presidentes/crear-presidente');
  }

  async eliminarPresidente(id: string, rut: string) {
    const alert = await this.alertController.create({
      header: '¿Seguro de Eliminar al Presidente?',
      subHeader: `Se eliminará al Presidente con RUT: ${rut}`,
      message: 'Recuerda que si aceptas, esta opción es irreversible.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
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
                message: `Has eliminado al Presidente con RUT ${rut}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getData();
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al eliminar al Presidente con RUT ${rut}. Inténtalo de nuevo.`,
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
			this.elementosFiltrados = this.presidentes;
		} else {
			this.elementosFiltrados = this.presidentes.filter(elemento =>
				elemento.name.toLowerCase().includes(textoBusqueda) ||
				elemento.rut_usuario.toLowerCase().includes(textoBusqueda)
			);
		}
	}
}
