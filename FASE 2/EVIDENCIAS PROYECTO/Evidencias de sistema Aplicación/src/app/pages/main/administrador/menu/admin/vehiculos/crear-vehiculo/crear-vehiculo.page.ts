import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonModal } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AbstractControl } from '@angular/forms';

import { User } from 'src/app/models/user';
import { Vehiculo } from 'src/app/models/vehiculo';
import { MarcaVehiculo, ModeloVehiculo } from 'src/app/models/marca-vehiculo';

import { v4 as uuidv4 } from 'uuid';

@Component({
	selector: 'app-crear-vehiculo',
	templateUrl: './crear-vehiculo.page.html',
	styleUrls: ['./crear-vehiculo.page.scss'],
})
export class CrearVehiculoPage implements OnInit {

	firebaseSvc = inject(FirebaseService);
	utilsSvc = inject(UtilsService);

	public imagenDefault = 'data:image/png;base64,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';
	public marca_vehiculo: MarcaVehiculo[];
	public modelo_vehiculo: ModeloVehiculo[];
	public modelosFiltrados: any[] = [];

	selectMarca = false;
	selectModelo: any;

	choferes!: any;
	usuario!: User;

	private uniqueId = '';
	form = new FormGroup({
		id: new FormControl(''),
		patente_vehiculo: new FormControl('', [Validators.required]),

		cad_revision_tecnica_vehiculo: new FormControl(''),
		cad_per_circulacion_vehiculo: new FormControl(''),
		cad_soap_vehiculo: new FormControl(''),

		img_vehiculo: new FormControl(this.imagenDefault),

		asientos_dispo_vehiculo: new FormControl('4'),
		coordenadas_vehiculo: new FormControl(''),

		usuario: new FormControl(''),
		central: new FormControl(''),
		en_ruta: new FormControl(false),

	})

	constructor() { }

	async ngOnInit() {
		// Suscribirse al observable del usuario
		this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
			this.usuario = user;
			// Aquí puedes realizar más acciones si es necesario
		});
		this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
		await this.getChoferesAndMarcas();

	}

	onMarcaChange(event: any) {
		const marcaSeleccionada = event.detail.value;
		// Filtrar los modelos según la marca seleccionada
		this.selectMarca = true;
		this.modelosFiltrados = this.modelo_vehiculo.filter(
			(modelo) => modelo.id_marca == marcaSeleccionada
		);
	}

	onModeloChange(event: any) {
		const modeloSeleccionado = event.detail.value;
		console.log(modeloSeleccionado)
		this.selectModelo = modeloSeleccionado;
	}

	async submit() {
		if (this.form.valid) {
			const loading = await this.utilsSvc.loading();
			await loading.present();

			try {
				// Generar un UID único
				this.uniqueId = uuidv4();
				console.log('uid', this.uniqueId);



				// Crear el objeto del nuevo vehículo
				const nuevoVehiculo = {
					...this.form.value,
					id: this.uniqueId, // Asigna el UID único aquí
					nombre_modelo: this.selectModelo.nombre_modelo,
					modelo: this.selectModelo.id,
					marca: this.selectModelo.id_marca,
					central: this.usuario.central, // Agregar la central del usuario
					en_ruta: false
				};

				// Guardar el nuevo vehículo en Firebase
				await this.firebaseSvc.addDocumentWithId('vehiculo', nuevoVehiculo, this.uniqueId);
				this.setVehicleInfo();
			} catch (error) {
				console.error('Error al agregar vehículo:', error);
				this.utilsSvc.presentToast({
					message: 'Error al agregar el vehículo. Inténtalo de nuevo.',
					duration: 1500,
					color: 'danger',
					position: 'middle',
					icon: 'alert-circle-outline',
				});
			} finally {
				loading.dismiss();
			}
		}
	}

	async setVehicleInfo() {
		if (this.form.valid) {
			const loading = await this.utilsSvc.loading();
			await loading.present();

			let path = `vehiculo/${this.uniqueId}`
			let imagePath = `vehiculo/${this.uniqueId}/${Date.now()}`;
			let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_vehiculo);
			this.form.controls.img_vehiculo.setValue(imageUrl)

			// Crear nuevamente el objeto, para guardarlo con la URL de la imagen.
			const nuevoVehiculo = {
				...this.form.value,
				id: this.uniqueId, // Asigna el UID único aquí
				nombre_modelo: this.selectModelo.nombre_modelo,
				modelo: this.selectModelo.id,
				marca: this.selectModelo.id_marca,
				central: this.usuario.central, // Agregar la central del usuario
				en_ruta: false
			};

			this.firebaseSvc.setDocument(path, nuevoVehiculo).then(async res => {
				this.utilsSvc.routerLink('/main/administrador/admin/vehiculos');
				this.form.reset();
				this.utilsSvc.presentToast({
					message: 'Vehículo creado con éxito',
					duration: 1500,
					color: 'primary',
					position: 'middle',
					icon: 'alert-circle-outline'
				})
			}).catch(error => {
				console.log(error);
				this.utilsSvc.presentToast({
					message: 'Las credenciales son incorrectas',
					duration: 1500,
					color: 'primary',
					position: 'middle',
					icon: 'alert-circle-outline'
				})

			}).finally(() => {
				loading.dismiss();
			})
		}
	}

	async getChoferesAndMarcas() {
		const loading = await this.utilsSvc.loading();
		await loading.present();

		const marcaVehiculo = 'marca_vehiculo';
		const modeloVehiculo = 'modelo_vehiculo';
		const usuarioPath = 'usuario'; // Ruta de la colección de usuarios

		try {
			// Ejecutar ambas promesas en paralelo
			const [marca_vehiculo, modelo_vehiculo, usuarios] = await Promise.all([
				this.firebaseSvc.getCollectionDocuments(marcaVehiculo) as Promise<MarcaVehiculo[]>,
				this.firebaseSvc.getCollectionDocuments(modeloVehiculo) as Promise<ModeloVehiculo[]>,
				this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]> // Cambia 'any' por el tipo adecuado si lo tienes
			]);

			this.marca_vehiculo = marca_vehiculo;
			this.modelo_vehiculo = modelo_vehiculo;

			// Verificar que this.usuario esté definido
			if (this.usuario && this.usuario.central) {
				// Filtrar los resultados para obtener solo los choferes de la misma central
				this.choferes = usuarios.filter(usuario => {
					return usuario.central === this.usuario.central && usuario.tipo_usuario === '2';
				});
			} else {
				console.error('Usuario no definido o sin central.');
				this.utilsSvc.presentToast({
					message: 'Error: Usuario no definido o sin central.',
					duration: 1500,
					color: 'danger',
					position: 'middle',
					icon: 'alert-circle-outline',
				});
			}

		} catch (error) {
			console.error(error);
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


	async takeImage() {
		const dataUrl = (await this.utilsSvc.takePicture('Foto de Vehículo')).dataUrl;
		this.form.controls.img_vehiculo.setValue(dataUrl);
	}
}
