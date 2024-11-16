import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-ver-rutas',
	templateUrl: './ver-rutas.page.html',
	styleUrls: ['./ver-rutas.page.scss'],
})
export class VerRutasPage implements OnInit {
	firebaseSvc = inject(FirebaseService);
	utilsSvc = inject(UtilsService);

	usuario!: User;
	rutas!: any;

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
		const urlPath = 'ruta_central'; // Ruta de la colección de usuarios

		try {
			// Ejecutar ambas promesas en paralelo
			const [ruta] = await Promise.all([
				this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>
			]);

			// Filtrar los resultados para obtener solo los choferes de la misma central
			this.rutas = ruta.filter(ruta =>
				ruta.central == this.usuario.central
			);

			this.elementosFiltrados = this.rutas; //Copiamos desde la variable

			if (this.rutas.length > 0) {
				this.utilsSvc.presentToast({
					message: 'Rutas Cargadas con Éxito',
					duration: 1500,
					color: 'success',
					position: 'middle',
					icon: 'checkmark-circle-outline'
				});
			} else {
				this.utilsSvc.presentToast({
					message: 'No hay Rutas disponibles',
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

	modificarRuta(id: string) {
		this.router.navigate(['/main/administrador/admin/rutas/modificar-ruta', id]);
	}

	crearRuta() {
		this.router.navigate(['/main/administrador/admin/rutas']);
	}


	async detallesRuta(ruta: any) {
		const alert = await this.alertController.create({
			header: `¿Seguro de modificar la ruta?`,
			subHeader: `Cambia los apartados de la ruta con nombre: ${ruta.nombre_ruta}`,
			inputs: [
				{
					name: 'nombre_ruta',
					type: 'text',
					placeholder: 'Nombre de la ruta',
					value: ruta.nombre_ruta, // Rellenar con el valor de ruta.nombre_ruta
				},
				{
					name: 'tarifa_diurna',
					type: 'number',
					placeholder: 'Tarifa Diurna',
					value: ruta.tarifa_diurna // Rellenar con el valor de ruta.tarifa_diurna
				},
				{
					name: 'tarifa_nocturna',
					type: 'number',
					placeholder: 'Tarifa Nocturna',
					value: ruta.tarifa_nocturna // Rellenar con el valor de ruta.tarifa_nocturna
				}
			],
			buttons: [
				{
					text: 'Cancelar',
					role: 'cancel',
				},
				{
					text: 'Confirmar Cambios',
					role: 'confirm',
					handler: async (data) => {
						const loading = await this.utilsSvc.loading();
						await loading.present();

						try {
							ruta.nombre_ruta = data.nombre_ruta;
							ruta.tarifa_diurna = data.tarifa_diurna;
							ruta.tarifa_nocturna = data.tarifa_nocturna;

							await this.firebaseSvc.updateDocument(`ruta_central/${ruta.id}`, { ...ruta });

							this.utilsSvc.presentToast({
								message: `Cambio realizado para la ruta ${ruta.nombre_ruta}`,
								duration: 1500,
								color: 'success',
								position: 'middle',
								icon: 'checkmark-circle-outline',
							});

							await this.getData();
						} catch (error) {
							console.error('Error al cambiar el estado de la ruta:', error);
							this.utilsSvc.presentToast({
								message: `Hubo un error al realizar el cambio en la ruta con nombre ${ruta.nombre_ruta}. Inténtalo de nuevo.`,
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


	async cambiarEstado(ruta: any) {
		let titulo = '';
		if (ruta.estado) {
			titulo = 'Desactivar'
		} else {
			titulo = 'Activar'
		}
		const alert = await this.alertController.create({
			header: `¿Seguro de ${titulo} la ruta?`,
			subHeader: `Se cambiará el estado a la Ruta con nombre: ${ruta.nombre_ruta}`,
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
							if (ruta.estado) {
								await this.firebaseSvc.updateDocument(`ruta_central/${ruta.id}`, { ...ruta, estado: false });
							} else {
								await this.firebaseSvc.updateDocument(`ruta_central/${ruta.id}`, { ...ruta, estado: true });
							}
							this.utilsSvc.presentToast({
								message: `Cambio realizado para el la ruta ${ruta.nombre_ruta}`,
								duration: 1500,
								color: 'success',
								position: 'middle',
								icon: 'checkmark-circle-outline',
							});

							await this.getData();
						} catch (error) {
							console.error('Error al cambiar el estado de la ruta:', error);
							this.utilsSvc.presentToast({
								message: `Hubo un error al realizar el cambio en la ruta con nombre ${ruta.nombre_ruta}. Inténtalo de nuevo.`,
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
			this.elementosFiltrados = this.rutas;
		} else {
			this.elementosFiltrados = this.rutas.filter(elemento =>
				elemento.nombre_ruta.toLowerCase().includes(textoBusqueda) ||
				elemento.estado.toLowerCase().includes(textoBusqueda)
			);
		}
	}
}
