import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CentralColectivo } from 'src/app/models/central-colectivo';

@Component({
  selector: 'app-choferes',
  templateUrl: './choferes.page.html',
  styleUrls: ['./choferes.page.scss'],
})
export class ChoferesPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  centrales!: CentralColectivo[];

  constructor(private router: Router) { }
  elementosFiltrados: any[] = [];  // Lista filtrada
  searchText: string = '';  // Texto de búsqueda

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    await this.getCentrales();
  }


  async getCentrales() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'central_colectivo'; // Ruta de la colección de usuarios
    const urlPath3 = 'usuario'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [callback, callback3] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<CentralColectivo[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath3) as Promise<any>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.centrales = callback;
      this.elementosFiltrados = this.centrales; //Copiamos desde la variable

      if (this.centrales.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Centrales Creadas',
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

  async choferes(central: any) {
    this.router.navigate(['/main/owner/central/pasajeros/choferes/ver-choferes', central.id]);
  }

  async verificarExistente(dato: string): Promise<boolean> {
    try {
      return this.centrales.some(callback => callback.nombre_central.toLowerCase() === dato.toLowerCase());
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
			this.elementosFiltrados = this.centrales;
		} else {
			this.elementosFiltrados = this.centrales.filter(elemento =>
				elemento.nombre_central.toLowerCase().includes(textoBusqueda)
			);
		}
	}

}
