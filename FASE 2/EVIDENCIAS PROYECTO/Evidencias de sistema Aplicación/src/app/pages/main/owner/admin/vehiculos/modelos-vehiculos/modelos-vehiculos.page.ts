import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { MarcaVehiculo, ModeloVehiculo } from 'src/app/models/marca-vehiculo';

@Component({
  selector: 'app-modelos-vehiculos',
  templateUrl: './modelos-vehiculos.page.html',
  styleUrls: ['./modelos-vehiculos.page.scss'],
})
export class ModelosVehiculosPage implements OnInit {


  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  modelos!: ModeloVehiculo[];
  marcas!: MarcaVehiculo[];

  private uniqueId = '';
  private marcaSeleccionado = '';

  constructor(private router: Router, private alertController: AlertController) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    await this.getData();
  }


  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'modelo_vehiculo'; // Ruta de la colección de usuarios
    const url2Path = 'marca_vehiculo'; // Ruta de la colección de usuarios


    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback2] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<ModeloVehiculo[]>,
        this.firebaseSvc.getCollectionDocuments(url2Path) as Promise<MarcaVehiculo[]>

      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.modelos = callback;
      this.marcas = callback2

      if (this.modelos.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Modelos Creados',
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

  async presentSelectMarca() {
    const alert = await this.alertController.create({
      header: 'Selecciona una Marca',
      inputs: this.marcas.map(marca => ({
        type: 'radio',
        label: marca.nombre_marca,
        value: marca.id,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Seleccionar',
          handler: (marcaId) => {
            // Asigna el país seleccionado
            this.marcaSeleccionado = marcaId;
            console.log('Marca seleccionado:', marcaId);
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
          placeholder: 'Ingresa el Nombre del Modelo',
        },
      ],
      buttons: [
        {
          text: 'Seleccionar Marca',
          handler: () => {
            // Abrir el ion-select para seleccionar el país
            this.presentSelectMarca();
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
            this.marcaSeleccionado = '';
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

            if (this.marcaSeleccionado == "") {
              this.utilsSvc.presentToast({
                message: 'Selecciona una Marca para el Modelo',
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
                message: 'Ya existe un Modelo con ese nombre',
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
                nombre_modelo: dato.nombre_dato,
                id_marca: this.marcaSeleccionado,
                estado: true,
              }

              // Mostrar un mensaje de éxito
              // Capturar la imagen
              const dataUrl = (await this.utilsSvc.takePicture('Imagen del Modelo')).dataUrl;
              if (dataUrl) {
                await this.firebaseSvc.addDocumentWithId('modelo_vehiculo', datoNuevo, this.uniqueId);

                let path = `modelo_vehiculo/${this.uniqueId}`;
                let imagePath = `modelo_vehiculo/${this.uniqueId}/${Date.now()}`;
                let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                // Actualizar el documento en Firestore con la URL de la imagen
                await this.firebaseSvc.setDocument(path, { ...datoNuevo, img_modelo: imageUrl });

                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Modelo creado con éxito',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                await this.getData();
              }
            } catch (error) {
              console.error('Error al crear el modelo:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear el modelo. Inténtalo de nuevo.',
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

  async cambiarFoto(dato: any) {
    // Preguntar si desea cambiar la imagen
    const confirmAlert = await this.alertController.create({
      header: 'Cambiar Imagen',
      message: '¿Deseas cambiar la imagen asociada?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: async () => {
            // Actualizar la lista de datos
            await this.getData();
          }
        },
        {
          text: 'Sí',
          role: 'confirm',
          handler: async () => {
            // Si el usuario selecciona "Sí", permite capturar la nueva imagen
            const dataUrl = (await this.utilsSvc.takePicture('Fotografía del Modelo')).dataUrl;

            if (dataUrl) {
              let imagePath = await this.firebaseSvc.getFilePath(dato.img_modelo);
              let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

              const datoModificado = {
                img_modelo: imageUrl // Se actualiza la imagen con la nueva URL
              };

              // Mostrar pantalla de carga
              const loading = await this.utilsSvc.loading();
              await loading.present();

              try {
                // Actualizar el documento en Firestore con la nueva URL de la imagen
                await this.firebaseSvc.updateDocument(`modelo_vehiculo/${dato.id}`, { ...datoModificado });
                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Imagen Asociada Actualizada',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                // Actualizar la lista de datos
                await this.getData();
              } catch (error) {
                console.error('Error al modificar el dato:', error);
                this.utilsSvc.presentToast({
                  message: 'Hubo un error al modificar el dato. Inténtalo de nuevo.',
                  duration: 1500,
                  color: 'danger',
                  position: 'middle',
                  icon: 'alert-circle-outline'
                });
              } finally {
                // Cerrar pantalla de carga
                loading.dismiss();
              }
            }
          }
        }]
    });

    await confirmAlert.present();
  }

  async modificar(modelo: any) {
    const alert = await this.alertController.create({
      header: 'Modificar Modelo',
      message: `Rellena todos los campos para modificar ${modelo.nombre_modelo}.`,
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Ingresa el Nombre del Modelo',
          value: modelo.nombre_modelo
        },
      ],
      buttons: [
        {
          text: 'Cambiar Marca (Opcional)',
          handler: () => {
            // Abrir el ion-select para seleccionar el país
            this.presentSelectMarca();
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

            if (this.marcaSeleccionado != "") {
              modelo.id_marca = this.marcaSeleccionado;
            }

            const existe = await this.verificarExistente(dato.nombre_dato);
            if (existe) {
              this.utilsSvc.presentToast({
                message: 'Ya existe un Modelo con ese nombre',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }

            // Si el usuario selecciona "No", solo se actualizan los datos sin cambiar la imagen
            const datoModificado = {
              nombre_modelo: dato.nombre_dato,
            }

            // Actualizar el documento en Firestore sin cambiar la imagen
            await this.firebaseSvc.updateDocument(`marca_vehiculo/${modelo.id}`, { ...datoModificado });

            // Mostrar un mensaje de éxito
            this.utilsSvc.presentToast({
              message: 'Modelo modificado con éxito',
              duration: 1500,
              color: 'primary',
              position: 'middle',
              icon: 'checkmark-circle-outline'
            });

            // Actualizar la lista de datos
            await this.getData();
          },
        },
      ],
    });

    await alert.present();
  }

  async estado(modelo: any) {
    let titulo = '';
    if (modelo.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} el Modelo de Vehículo?`,
      subHeader: `Se cambiará el estado a la Ciudad con nombre: ${modelo.nombre_modelo}`,
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
              if (modelo.estado) {
                await this.firebaseSvc.updateDocument(`ciudad/${modelo.id}`, { ...modelo, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`modelo/${modelo.id}`, { ...modelo, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para el modelo ${modelo.nombre_modelo}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getData();
            } catch (error) {
              console.error('Error al cambiar el estado del modelo:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio en el modelo con nombre ${modelo.nombre_modelo}. Inténtalo de nuevo.`,
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
      return this.modelos.some(callback => callback.nombre_modelo.toLowerCase() === dato.toLowerCase());
    } catch (error) {
      console.error('Error al verificar si el dato ya existe:', error);
      return false;
    }
  }


}
