import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { Comuna } from 'src/app/models/comuna';
import { Ciudad } from 'src/app/models/ciudad';
import { Pais } from 'src/app/models/pais';

@Component({
  selector: 'app-comunas',
  templateUrl: './comunas.page.html',
  styleUrls: ['./comunas.page.scss'],
})
export class ComunasPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  comunas!: Comuna[];
  ciudades!: Ciudad[];
  paises!: Pais[];

  private uniqueId = '';
  private paisSeleccionado = '';
  private ciudadSeleccionada = '';

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
    const urlPath = 'comuna'; // Ruta de la colección de usuarios
    const url2Path = 'ciudad'; // Ruta de la colección de usuarios
    const url3Path = 'pais'; // Ruta de la colección de usuarios


    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback2, callback3] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<Comuna[]>,
        this.firebaseSvc.getCollectionDocuments(url2Path) as Promise<Ciudad[]>,
        this.firebaseSvc.getCollectionDocuments(url3Path) as Promise<Pais[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.comunas = callback;
      this.ciudades = callback2
      this.paises = callback3;

      if (this.comunas.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Comunas Creadas',
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

  async presentSelectCiudad() {
    const alert = await this.alertController.create({
      header: 'Selecciona una Ciudad',
      inputs: this.ciudades.filter(filter => filter.pais == this.paisSeleccionado ).map(ciudad => ({
        type: 'radio',
        label: ciudad.nombre_ciudad,
        value: ciudad.id,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Seleccionar',
          handler: (ciudadId) => {
            // Asigna el país seleccionado
            this.ciudadSeleccionada = ciudadId;
            console.log('Ciudad seleccionada:', ciudadId);
          }
        }
      ]
    });

    await alert.present();
  }

  async crear() {
    const alert = await this.alertController.create({
      header: 'Agregar una Comuna',
      message: 'Rellena todos los campos para agregar el nuevo dato.',
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre de la Comuna',
        },
      ],
      buttons: [
        {
          text: 'Seleccionar País',
          handler: async () => {
            // Abrir el ion-select para seleccionar el país
            await this.presentSelectPais();
            return false; // Evitar que el alert se cierre al presionar este botón
          }
        },
        {
          text: 'Seleccionar Ciudad',
          handler: async () => {
            // Abrir el ion-select para seleccionar el país
            await this.presentSelectCiudad();
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
                message: 'Selecciona un País para añadir una Ciudad a la Comuna',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            if (this.ciudadSeleccionada == "") {
              this.utilsSvc.presentToast({
                message: 'Selecciona una Ciudad para la Comuna',
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
                message: 'Ya existe una Comuna con ese nombre',
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
                nombre_comuna: dato.nombre_dato,
                ciudad: this.ciudadSeleccionada,
                estado: true,
              }

              await this.firebaseSvc.addDocumentWithId('comuna', datoNuevo, this.uniqueId);
              // Mostrar un mensaje de éxito
              this.utilsSvc.presentToast({
                message: 'Comuna creada con éxito',
                duration: 1500,
                color: 'primary',
                position: 'middle',
                icon: 'checkmark-circle-outline'
              });

              // Actualizar la lista de bancos
              await this.getData();

            } catch (error) {
              console.error('Error al crear la comuna:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear la comuna. Inténtalo de nuevo.',
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


  async modificar(comuna: any) {
    const alert = await this.alertController.create({
      header: 'Modificar Comuna',
      message: `Rellena todos los campos para modificar ${comuna.nombre_comuna}.`,
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre de la Comuna',
          value: comuna.nombre_comuna
        },
      ],
      buttons: [
        {
          text: 'Cambiar País',
          handler: async () => {
            // Abrir el ion-select para seleccionar el país
            await this.presentSelectPais();
            return false; // Evitar que el alert se cierre al presionar este botón
          }
        },
        {
          text: 'Cambiar Ciudad',
          handler: async () => {
            // Abrir el ion-select para seleccionar el país
            await this.presentSelectCiudad();
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

            if (this.ciudadSeleccionada != "") {
              comuna.ciudad = this.ciudadSeleccionada;
            }

            // Mostrar pantalla de carga
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {

              const datoModificado = {
                nombre_comuna: dato.nombre_dato,
                ciudad: comuna.ciudad
              };
              // Actualizar el documento en Firestore sin cambiar la imagen
              await this.firebaseSvc.updateDocument(`comuna/${comuna.id}`, { ...datoModificado });
              // Mostrar un mensaje de éxito
              this.utilsSvc.presentToast({
                message: 'Comuna modificada con éxito',
                duration: 1500,
                color: 'primary',
                position: 'middle',
                icon: 'checkmark-circle-outline'
              });
              // Actualizar la lista de datos
              await this.getData();

            } catch (error) {
              console.error('Error al modificar la Comuna:', error);
              this.utilsSvc.presentToast({
                message: 'Hubo un error al modificar la Comuna. Inténtalo de nuevo.',
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

  async cambiarEstado(comuna: any) {
    let titulo = '';
    if (comuna.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} la Comuna?`,
      subHeader: `Se cambiará el estado la Comuna con nombre: ${comuna.nombre_comuna}`,
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
              if (comuna.estado) {
                await this.firebaseSvc.updateDocument(`comuna/${comuna.id}`, { ...comuna, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`comuna/${comuna.id}`, { ...comuna, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para la Comuna ${comuna.nombre_comuna}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getData();
            } catch (error) {
              console.error('Error al cambiar el estado comuna:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio en el comuna con nombre ${comuna.nombre_comuna}. Inténtalo de nuevo.`,
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
      return this.comunas.some(callback => callback.nombre_comuna.toLowerCase() === dato.toLowerCase());
    } catch (error) {
      console.error('Error al verificar si el dato ya existe:', error);
      return false;
    }
  }

}
