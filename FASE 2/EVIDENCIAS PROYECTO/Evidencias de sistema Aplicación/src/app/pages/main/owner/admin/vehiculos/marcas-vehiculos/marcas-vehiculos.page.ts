import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

import { v4 as uuidv4 } from 'uuid';
import { MarcaVehiculo } from 'src/app/models/marca-vehiculo';

@Component({
  selector: 'app-marcas-vehiculos',
  templateUrl: './marcas-vehiculos.page.html',
  styleUrls: ['./marcas-vehiculos.page.scss'],
})
export class MarcasVehiculosPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  marcas!: MarcaVehiculo[];
  private uniqueId = '';

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
    const urlPath = 'marca_vehiculo'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [callback] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<MarcaVehiculo[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.marcas = callback;
      this.elementosFiltrados = this.marcas; //Copiamos desde la variable

      if (this.marcas.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Marcas de Vehículos Creadas',
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


  async crear() {
    const alert = await this.alertController.create({
      header: 'Agregar un Nueva Marca',
      message: 'Rellena todos los campos para agregar la nueva marca.',
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre de la Marca',
        },
      ],
      buttons: [
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
          text: 'Agregar',
          role: 'confirm',
          handler: async (dato) => {
            if (dato.nombre_dato == "") {
              this.utilsSvc.presentToast({
                message: 'Debes agregar un nombre a la Marca',
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
                message: 'Ya existe una marca con ese nombre',
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
                nombre_marca: dato.nombre_dato,
                estado: true,
              }

              // Capturar la imagen
              const dataUrl = (await this.utilsSvc.takePicture('Logo de la Marca')).dataUrl;

              if (dataUrl) {
                await this.firebaseSvc.addDocumentWithId('marca_vehiculo', datoNuevo, this.uniqueId);

                let path = `marca_vehiculo/${this.uniqueId}`;
                let imagePath = `marca_vehiculo/${this.uniqueId}/${Date.now()}`;
                let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

                // Actualizar el documento en Firestore con la URL de la imagen
                await this.firebaseSvc.setDocument(path, { ...datoNuevo, img_marca: imageUrl });

                // Mostrar un mensaje de éxito
                this.utilsSvc.presentToast({
                  message: 'Marca creada con éxito',
                  duration: 1500,
                  color: 'primary',
                  position: 'middle',
                  icon: 'checkmark-circle-outline'
                });

                await this.getData();
              }
            } catch (error) {
              console.error('Error al crear la marca:', error);
              this.utilsSvc.presentToast({
                message: 'Error al crear la marca. Inténtalo de nuevo.',
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
            const dataUrl = (await this.utilsSvc.takePicture('Logo de Marca')).dataUrl;

            if (dataUrl) {
              let imagePath = await this.firebaseSvc.getFilePath(dato.img_marca);
              let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

              const datoModificado = {
                img_marca: imageUrl // Se actualiza la imagen con la nueva URL
              };

              // Mostrar pantalla de carga
              const loading = await this.utilsSvc.loading();
              await loading.present();

              try {
                // Actualizar el documento en Firestore con la nueva URL de la imagen
                await this.firebaseSvc.updateDocument(`marca_vehiculo/${dato.id}`, { ...datoModificado });
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

  async modificar(marca: any) {
    const alert = await this.alertController.create({
      header: 'Modificar Marca',
      message: `Rellena todos los campos para modificar ${marca.nombre_marca}.`,
      inputs: [
        {
          name: 'nombre_dato',
          type: 'text',
          min: 6,
          max: 50,
          placeholder: 'Nombre de la Marca',
          value: marca.nombre_marca
        },
      ],
      buttons: [
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
                message: 'Debes agregar un nombre a la Marca',
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
                message: 'Ya existe una Marca con ese nombre',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'alert-circle-outline'
              });
              return;
            }
            // Si el usuario selecciona "No", solo se actualizan los datos sin cambiar la imagen
            const datoModificado = {
              nombre_marca: dato.nombre_dato,
            }

            // Actualizar el documento en Firestore sin cambiar la imagen
            await this.firebaseSvc.updateDocument(`marca_vehiculo/${marca.id}`, { ...datoModificado });

            // Mostrar un mensaje de éxito
            this.utilsSvc.presentToast({
              message: 'Marca modificado con éxito',
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

  async estado(marca: any) {
    let titulo = '';
    if (marca.estado) {
      titulo = 'Desactivar'
    } else {
      titulo = 'Activar'
    }
    const alert = await this.alertController.create({
      header: `¿Seguro de ${titulo} la marca?`,
      subHeader: `Se cambiará el estado la marca con nombre: ${marca.nombre_marca}`,
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
              if (marca.estado) {
                await this.firebaseSvc.updateDocument(`marca_vehiculo/${marca.id}`, { ...marca, estado: false });
              } else {
                await this.firebaseSvc.updateDocument(`marca_vehiculo/${marca.id}`, { ...marca, estado: true });
              }
              this.utilsSvc.presentToast({
                message: `Cambio realizado para la Marca ${marca.nombre_marca}`,
                duration: 1500,
                color: 'success',
                position: 'middle',
                icon: 'checkmark-circle-outline',
              });

              await this.getData();
            } catch (error) {
              console.error('Error al cambiar el estado de la Marca:', error);
              this.utilsSvc.presentToast({
                message: `Hubo un error al realizar el cambio en la marca con nombre ${marca.nombre_marca}. Inténtalo de nuevo.`,
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
      return this.marcas.some(callback => callback.nombre_marca.toLowerCase() === dato.toLowerCase());
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
			this.elementosFiltrados = this.marcas;
		} else {
			this.elementosFiltrados = this.marcas.filter(elemento =>
				elemento.nombre_marca.toLowerCase().includes(textoBusqueda)
			);
		}
	}
}