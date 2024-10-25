import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CentralColectivo } from 'src/app/models/central-colectivo';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
	selector: 'app-vehiculos',
	templateUrl: './vehiculos.page.html',
	styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
	firebaseSvc = inject(FirebaseService);
	utilsSvc = inject(UtilsService);

	usuario!: User;
	vehiculos!: any;
	central!: CentralColectivo;

	constructor(private router: Router, private alertController: AlertController) { }

	async ngOnInit() {
		// Suscribirse al observable del usuario
		this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
			this.usuario = user;
			// Aquí puedes realizar más acciones si es necesario
		});
		this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
		await this.getVehiculos();
	}


	async getVehiculos() {
		const loading = await this.utilsSvc.loading();
		await loading.present();
		const vehPath = 'vehiculo'; // Ruta de la colección de usuarios

		try {
			// Ejecutar ambas promesas en paralelo
			const [vehiculos] = await Promise.all([
				this.firebaseSvc.getCollectionDocuments(vehPath) as Promise<any[]>
			]);

			// Filtrar los resultados para obtener solo los choferes de la misma central
			this.vehiculos = vehiculos.filter(vehiculo =>
				vehiculo.central == this.usuario.central
			);

			if (this.vehiculos.length > 0) {
				this.utilsSvc.presentToast({
					message: 'Vehículos Cargados con Éxito',
					duration: 1500,
					color: 'success',
					position: 'middle',
					icon: 'checkmark-circle-outline'
				});
			} else {
				this.utilsSvc.presentToast({
					message: 'No hay vehículos disponibles',
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

	modificarVehiculo(id: string) {
		this.router.navigate(['/main/administrador/admin/vehiculos/modificar-vehiculo', id]);
	}

	detalleVehiculo(id: string) {
		this.router.navigate(['/main/administrador/admin/vehiculos/detalle-vehiculo', id]);
	}

	crearVehiculo() {
		this.router.navigate(['/main/administrador/admin/vehiculos/crear-vehiculo']);
	}

	async eliminarVehiculo(id: string, patente: string) {
		const alert = await this.alertController.create({
			header: '¿Seguro de eliminar el vehiculo?',
			subHeader: `Se eliminará al vehiculo con Patente: ${patente}`,
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
							await this.firebaseSvc.deleteDocument(`vehiculo/${id}`);

							this.utilsSvc.presentToast({
								message: `Has eliminado el vehículo con patente ${patente}`,
								duration: 1500,
								color: 'success',
								position: 'middle',
								icon: 'checkmark-circle-outline',
							});

							await this.getVehiculos();
						} catch (error) {
							console.error('Error al eliminar vehículo:', error);
							this.utilsSvc.presentToast({
								message: `Hubo un error al eliminar el vehículo con patente ${patente}. Inténtalo de nuevo.`,
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
}

