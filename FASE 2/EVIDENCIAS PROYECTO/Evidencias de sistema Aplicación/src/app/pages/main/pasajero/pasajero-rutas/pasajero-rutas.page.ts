import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user';
@Component({
  selector: 'app-pasajero-rutas',
  templateUrl: './pasajero-rutas.page.html',
  styleUrls: ['./pasajero-rutas.page.scss'],
})
export class PasajeroRutasPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  routePoints:any = [];

  filteredRoutes: any[] = [];   // Lista de rutas filtradas
  searchTerm: string = '';      // Término de búsqueda actual

  constructor() { }

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
		const urlPath = 'ruta_central'; // Ruta de la colección de usuarios

		try {
			// Ejecutar ambas promesas en paralelo
			const [ruta] = await Promise.all([
				this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<any[]>
			]);

			this.routePoints = ruta;
      		
			this.filteredRoutes = [...this.routePoints];

			if (this.routePoints.length > 0) {
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

	searchRoutes(event: any) {
		this.searchTerm = event.target.value.toLowerCase(); // Convierte el término de búsqueda a minúsculas
		this.filteredRoutes = this.routePoints.filter(ruta => {
		  return ruta.nombre_ruta.toLowerCase().includes(this.searchTerm);
		});
	}

	isNightTime(): boolean {
		const horaActual = new Date().getHours();
		return horaActual >= 20 || horaActual < 6;
	}

}
