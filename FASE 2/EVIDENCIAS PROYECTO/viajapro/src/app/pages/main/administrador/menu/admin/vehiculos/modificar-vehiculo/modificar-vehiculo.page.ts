import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';
import { MarcaVehiculo, ModeloVehiculo } from 'src/app/models/marca-vehiculo';

@Component({
  selector: 'app-modificar-vehiculo',
  templateUrl: './modificar-vehiculo.page.html',
  styleUrls: ['./modificar-vehiculo.page.scss'],
})
export class ModificarVehiculoPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  public imagenDefault = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xNzY1XzcwNTUpIj4KPHBhdGggZD0iTTAgMEg1MTJWNTEySDBWMFoiIGZpbGw9IiMyMjJEM0EiLz4KPHBhdGggZD0iTTMzMC4wODUgMTEwLjk1NUMzMTEuMjk5IDkwLjY3MiAyODUuMDU5IDc5LjUwMjQgMjU2LjA5NyA3OS41MDI0QzIyNi45ODEgNzkuNTAyNCAyMDAuNjU1IDkwLjYwNDQgMTgxLjk1NSAxMTAuNzYyQzE2My4wNTMgMTMxLjE0MSAxNTMuODQzIDE1OC44MzggMTU2LjAwNSAxODguNzQ2QzE2MC4yOTIgMjQ3Ljc1MSAyMDUuMTkyIDI5NS43NSAyNTYuMDk3IDI5NS43NUMzMDcuMDAzIDI5NS43NSAzNTEuODI2IDI0Ny43NiAzNTYuMTggMTg4Ljc2NUMzNTguMzcxIDE1OS4xMjggMzQ5LjEwMyAxMzEuNDg5IDMzMC4wODUgMTEwLjk1NVoiIGZpbGw9IiNCM0JBQzAiLz4KPHBhdGggZD0iTTUzLjkyNzUgNTExLjk5N0g0NTguMzMzQzQ1OSA1MDMgNDU4LjIwNiA0ODMuNDk5IDQ1Ni4zMzMgNDczLjE0MUM0NDguMTg1IDQyNy45NDEgNDIyLjc1NyAzODkuOTcyIDM4Mi43ODkgMzYzLjMyN0MzNDcuMjgyIDMzOS42NzUgMzAyLjMwNSAzMjYuNjQyIDI1Ni4xMyAzMjYuNjQyQzIwOS45NTYgMzI2LjY0MiAxNjQuOTc4IDMzOS42NjYgMTI5LjQ3MSAzNjMuMzI3Qzg5LjUwMzggMzg5Ljk4MiA2NC4wNzU0IDQyNy45NTEgNTUuOTI3NSA0NzMuMTVDNTQuMDU0NiA0ODMuNTA5IDUzLjUwMDEgNTA0LjUgNTMuOTI3NSA1MTEuOTk3WiIgZmlsbD0iI0IzQkFDMCIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE3NjVfNzA1NSI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=';
  public marca_vehiculo: MarcaVehiculo[];
	public modelo_vehiculo: ModeloVehiculo[];
	public modelosFiltrados: any[] = [];
  
  vehiculo!: any;
  selectMarca = false;
	selectModelo = '';
	choferes!: any;
	usuario!: User;

	form = new FormGroup({
		patente_vehiculo: new FormControl('', [Validators.required]),

		cad_revision_tecnica_vehiculo: new FormControl(''),
		cad_per_circulacion_vehiculo: new FormControl(''),
		cad_soap_vehiculo: new FormControl(''),

		img_vehiculo: new FormControl(this.imagenDefault),

		asientos_dispo_vehiculo: new FormControl('4'),
		coordenadas_vehiculo: new FormControl(''),

		usuario: new FormControl(''),
		central: new FormControl(''),
	})

  constructor(private route: ActivatedRoute) { }

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

          // Aquí puedes hacer lo que necesites con el usuario obtenido, por ejemplo, mostrarlo en el formulario
          this.form.patchValue({
            cad_revision_tecnica_vehiculo: vehObtenido['cad_revision_tecnica_vehiculo'],
            cad_per_circulacion_vehiculo: vehObtenido['cad_per_circulacion_vehiculo'],
            cad_soap_vehiculo: vehObtenido['cad_soap_vehiculo'],
            img_vehiculo: vehObtenido['img_vehiculo']
          });
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

  onMarcaChange(event: any) {
		const marcaSeleccionada = event.detail.value;
		// Filtrar los modelos según la marca seleccionada
		this.selectMarca = true;
		this.modelosFiltrados = this.modelo_vehiculo.filter(
			(modelo) => modelo.id_marca == marcaSeleccionada
		);
	}

	onModeloChange(event: any){
		const modeloSeleccionado = event.detail.value;
		console.log(modeloSeleccionado)
		this.selectModelo = modeloSeleccionado;
	}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        // Actualizar la información del usuario en Firebase

        if (this.form.value.img_vehiculo !== this.vehiculo.img_vehiculo) {
          //Si la imagen es default, entonces creará una nueva cosa en el storage para evitar errores
          if (this.vehiculo.img_vehiculo == this.imagenDefault || this.vehiculo.img_vehiculo == '') {
            let imagePath = `vehiculo/${this.vehiculo.id}}/${Date.now()}`;
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_vehiculo);
            this.form.controls.img_vehiculo.setValue(imageUrl)
            
          } else {
            let imagePath = await this.firebaseSvc.getFilePath(this.vehiculo.img_vehiculo);
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_vehiculo);
            this.form.controls.img_vehiculo.setValue(imageUrl)
          }

          this.vehiculo.img_vehiculo = this.form.value.img_vehiculo
        }

        await this.firebaseSvc.updateDocument(`vehiculo/${this.vehiculo.id}`, this.form.value);
        this.vehiculo = {...this.vehiculo, ...this.form.value}

        // Rellenar el formulario con los datos del usuario autenticado
        this.form.patchValue({
          cad_revision_tecnica_vehiculo: this.vehiculo.cad_revision_tecnica_vehiculo,
          cad_per_circulacion_vehiculo: this.vehiculo.cad_per_circulacion_vehiculo,
          cad_soap_vehiculo: this.vehiculo.cad_soap_vehiculo,
          img_vehiculo: this.vehiculo.img_vehiculo
        });

        this.utilsSvc.presentToast({
          message: 'Vehículo actualizado con éxito.',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.error('Error actualizando Vehículo:', error);
        this.utilsSvc.presentToast({
          message: 'Error al actualizar el Vehículo. Inténtalo de nuevo.',
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
