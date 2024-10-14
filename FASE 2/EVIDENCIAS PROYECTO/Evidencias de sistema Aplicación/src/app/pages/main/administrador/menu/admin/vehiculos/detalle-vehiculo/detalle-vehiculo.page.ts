import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MarcaVehiculo } from 'src/app/models/marca-vehiculo';

@Component({
  selector: 'app-detalle-vehiculo',
  templateUrl: './detalle-vehiculo.page.html',
  styleUrls: ['./detalle-vehiculo.page.scss'],
})
export class DetalleVehiculoPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  public imagenDefault = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xNzY1XzcwNTUpIj4KPHBhdGggZD0iTTAgMEg1MTJWNTEySDBWMFoiIGZpbGw9IiMyMjJEM0EiLz4KPHBhdGggZD0iTTMzMC4wODUgMTEwLjk1NUMzMTEuMjk5IDkwLjY3MiAyODUuMDU5IDc5LjUwMjQgMjU2LjA5NyA3OS41MDI0QzIyNi45ODEgNzkuNTAyNCAyMDAuNjU1IDkwLjYwNDQgMTgxLjk1NSAxMTAuNzYyQzE2My4wNTMgMTMxLjE0MSAxNTMuODQzIDE1OC44MzggMTU2LjAwNSAxODguNzQ2QzE2MC4yOTIgMjQ3Ljc1MSAyMDUuMTkyIDI5NS43NSAyNTYuMDk3IDI5NS43NUMzMDcuMDAzIDI5NS43NSAzNTEuODI2IDI0Ny43NiAzNTYuMTggMTg4Ljc2NUMzNTguMzcxIDE1OS4xMjggMzQ5LjEwMyAxMzEuNDg5IDMzMC4wODUgMTEwLjk1NVoiIGZpbGw9IiNCM0JBQzAiLz4KPHBhdGggZD0iTTUzLjkyNzUgNTExLjk5N0g0NTguMzMzQzQ1OSA1MDMgNDU4LjIwNiA0ODMuNDk5IDQ1Ni4zMzMgNDczLjE0MUM0NDguMTg1IDQyNy45NDEgNDIyLjc1NyAzODkuOTcyIDM4Mi43ODkgMzYzLjMyN0MzNDcuMjgyIDMzOS42NzUgMzAyLjMwNSAzMjYuNjQyIDI1Ni4xMyAzMjYuNjQyQzIwOS45NTYgMzI2LjY0MiAxNjQuOTc4IDMzOS42NjYgMTI5LjQ3MSAzNjMuMzI3Qzg5LjUwMzggMzg5Ljk4MiA2NC4wNzU0IDQyNy45NTEgNTUuOTI3NSA0NzMuMTVDNTQuMDU0NiA0ODMuNTA5IDUzLjUwMDEgNTA0LjUgNTMuOTI3NSA1MTEuOTk3WiIgZmlsbD0iI0IzQkFDMCIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE3NjVfNzA1NSI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=';
  usuario!: User;
  vehiculo!: any;
  choferes!: any;
  marca_vehiculo!: any;

  constructor(private route: ActivatedRoute, private router: Router) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });

    // Obtener usuario del local storage
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    await this.getChoferesAndMarcas();

    // Obtener el ID de la URL
    await this.route.params.subscribe(async params => {
      const id = params['id'];
      console.log('ID recibido:', id);

      try {
        // Obtener el usuario con el ID desde Firebase
        const vehObtenido = await this.firebaseSvc.getDocument(`vehiculo/${id}`);

        // Verificar si el Vehículo obtenido pertenece a la misma "central" y si es un vehiculo
        if (vehObtenido && vehObtenido['central'] == this.usuario.central) {
          console.log('Vehículo válido:', vehObtenido);
          this.vehiculo = vehObtenido;

        } else {
          console.error('Error: El vehículo no tiene los permisos necesarios o no pertenece a la misma central.');
          this.utilsSvc.presentToast({
            message: 'No tienes permiso para acceder a este vehículo.',
            duration: 1500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        }
      } catch (error) {
        console.error('Error al obtener el vehúclo desde Firebase:', error);
        this.utilsSvc.presentToast({
          message: 'Error al obtener los datos del vehículo.',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      }
    });
  }

  modificarVehiculo() {
		this.router.navigate(['/main/administrador/admin/vehiculos/modificar-vehiculo', this.vehiculo.id]);
	}
  
  async getChoferesAndMarcas() {
		const loading = await this.utilsSvc.loading();
		await loading.present();

		const marcaVehiculo = 'marca_vehiculo';
		const usuarioPath = 'usuario'; // Ruta de la colección de usuarios

		try {
			// Ejecutar ambas promesas en paralelo
			const [marca_vehiculo, usuarios] = await Promise.all([
				this.firebaseSvc.getCollectionDocuments(marcaVehiculo) as Promise<MarcaVehiculo[]>,
				this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]> // Cambia 'any' por el tipo adecuado si lo tienes
			]);

			this.marca_vehiculo = marca_vehiculo;

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
}
