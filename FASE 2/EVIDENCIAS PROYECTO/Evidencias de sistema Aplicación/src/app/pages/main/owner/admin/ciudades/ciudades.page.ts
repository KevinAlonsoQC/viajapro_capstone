import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { Pais } from 'src/app/models/pais';
import { Ciudad } from 'src/app/models/ciudad';

@Component({
  selector: 'app-ciudades',
  templateUrl: './ciudades.page.html',
  styleUrls: ['./ciudades.page.scss'],
})
export class CiudadesPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  ciudades!: Ciudad[];
  paises!: Pais[];

  private uniqueId = '';
  private paisSeleccionado = '';

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
    const urlPath = 'ciudad'; // Ruta de la colección de usuarios
    const url2Path = 'pais'; // Ruta de la colección de usuarios


    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback2] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<Ciudad[]>,
        this.firebaseSvc.getCollectionDocuments(url2Path) as Promise<Pais[]>

      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.ciudades = callback;
      this.paises = callback2

      this.elementosFiltrados = this.ciudades; //Copiamos desde la variable

      if (this.ciudades.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Regiones Creadas',
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

  async presentSelectPais() {
    const alert = await this.alertController.create({
      header: 'Selecciona un País',
      inputs: this.paises.map(pais => ({
        type: 'radio',
        label: pais.nombre_pais,
        value: pais.id,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Seleccionar',
          handler: (paisId) => {
            // Asigna el país seleccionado
            this.paisSeleccionado = paisId;
            console.log('País seleccionado:', paisId);
          }
        }
      ]
    });

    await alert.present();
  }

  async crear() {
    const alert = await this.alertController.create({
      header: 'Agregar un Nuevo Dato',
      message: 'Rellena todos los campos para agregar el nuevo dato.',
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre de la Región',
        },
      ],
      buttons: [
        {
          text: 'Seleccionar País',
          handler: () => {
            // Abrir el ion-select para seleccionar el país
            this.presentSelectPais();
            return false; // Evitar que el alert se cierre al presionar este botón
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            this.utilsSvc.presentToast({
              message: 'Cancelaste la acción',
              duration: 1500,
              color: 'primary',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
            this.paisSeleccionado = '';
          },
        },
        {
          text: 'Agregar',
          role: 'confirm',
          handler: async (dato) => {
            if (dato.nombre_dato == "") {
              this.utilsSvc.presentToast({
                message: 'No puedes dejar datos vacíos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            if (this.paisSeleccionado == "") {
              this.utilsSvc.presentToast({
                message: 'Selecciona un País para la Región',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            const existe = await this.verificarExistente(dato.nombre_dato);
            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe una Región con ese nombre',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }
            // Mostrar pantalla de carga
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              // Generar un UID único
              this.uniqueId = uuidv4();

              const datoNuevo = {
                id: this.uniqueId,
                nombre_ciudad: dato.nombre_dato,
                pais: this.paisSeleccionado,
                estado: true,
              }

              await this.firebaseSvc.addDocumentWithId('ciudad', datoNuevo, this.uniqueId);
              // Mostrar un mensaje de éxito
              this.utilsSvc.presentToast({
                message: 'Región creada con éxito',
                duration: 1500,
                color: 'primary',
                position: 'middle',
                icon: 'checkmark-circle-outline'
              });

              // Actualizar la lista de bancos
              await this.getData();

            } catch (error) {
              console.error('Error al crear la Región:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear la Región. Inténtalo de nuevo.',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline',
              });
            } finally {
              // Cerrar pantalla de carga
              loading.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }


  async modificar(ciudad: any) {
    const alert = await this.alertController.create({
      header: 'Modificar Región',
      message: `Rellena todos los campos para modificar ${ciudad.nombre_ciudad}.`,
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre de la Región',
          value: ciudad.nombre_ciudad
        },
      ],
      buttons: [
        {
          text: 'Cambiar País (Opcional)',
          handler: () => {
            // Abrir el ion-select para seleccionar el país
            this.presentSelectPais();
            return false; // Evitar que el alert se cierre al presionar este botón
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
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
          text: 'Modificar',
          role: 'confirm',
          handler: async (dato) => {
            if (dato.nombre_dato == "") {
              this.utilsSvc.presentToast({
                message: 'No puedes dejar datos vacíos',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            if (this.paisSeleccionado != "") {
              ciudad.pais = this.paisSeleccionado;
            }

            // Mostrar pantalla de carga
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {

              const datoModificado = {
                nombre_ciudad: dato.nombre_dato,
                pais: ciudad.pais
              };
              // Actualizar el documento en Firestore sin cambiar la imagen
              await this.firebaseSvc.updateDocument(`ciudad/${ciudad.id}`, { ...datoModificado });
              // Mostrar un mensaje de éxito
              this.utilsSvc.presentToast({
                message: 'Región modificada con éxito',
                duration: 1500,
                color: 'primary',
                position: 'middle',
                icon: 'checkmark-circle-outline'
              });
              // Actualizar la lista de datos
              await this.getData();

            } catch (error) {
              console.error('Error al modificar la Región:', error);
              this.utilsSvc.presentToast({
                message: 'Hubo un error al modificar la Región. Inténtalo de nuevo.',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
            } finally {
              // Cerrar pantalla de carga
              loading.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async cambiarEstado(ciudad: any) {
    let titulo = '';
    if (ciudad.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} la Región?`,
      subHeader: `Se cambiará el estado a la Región con nombre: ${ciudad.nombre_ciudad}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: titulo,
          role: 'confirm',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              // Elimina el documento de Firebase
              //await this.firebaseSvc.deleteDocument(`banco/${banco.id}`);
              //En vez de eliminarlo se pone como estado 0, porque si lo eliminamos, y llegasen a existir datos con un banco, al eliminarlo causará
              //un error a escala!
              if (ciudad.estado) {
                await this.firebaseSvc.updateDocument(`ciudad/${ciudad.id}`, { ...ciudad, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`ciudad/${ciudad.id}`, { ...ciudad, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para la Región ${ciudad.nombre_ciudad}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getData();
            } catch (error) {
              console.error('Error al cambiar el estado Región:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio en la Región con nombre ${ciudad.nombre_ciudad}. Inténtalo de nuevo.`,
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

  async verificarExistente(dato: string): Promise<boolean> {
    try {
      return this.ciudades.some(callback => callback.nombre_ciudad.toLowerCase() === dato.toLowerCase());
    } catch (error) {
      console.error('Error al verificar si el dato ya existe:', error);
      return false;
    }
  }

  // Función para filtrar
  filtrar(event: any) {
    const textoBusqueda = event.target.value.toLowerCase();  // Captura el valor ingresado y lo convierte a minúsculas

    // Filtrar los choferes por nombre o rut
    if (textoBusqueda.trim() === '') {
      // Si no hay texto de búsqueda, mostrar todos los choferes
      this.elementosFiltrados = this.ciudades;
    } else {
      this.elementosFiltrados = this.ciudades.filter(elemento =>
        elemento.nombre_ciudad.toLowerCase().includes(textoBusqueda)
      );
    }
  }

}
