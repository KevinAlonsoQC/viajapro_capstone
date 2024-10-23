import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';
import { CentralColectivo } from 'src/app/models/central-colectivo';
import { Comuna } from 'src/app/models/comuna';

@Component({
  selector: 'app-detalle-central',
  templateUrl: './detalle-central.page.html',
  styleUrls: ['./detalle-central.page.scss'],
})
export class DetalleCentralPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  presidente!: any;

  central!: any;
  comuna!: any;
  presidentes!: any;

  form = new FormGroup({
    nombre_central: new FormControl('', [Validators.required, Validators.minLength(3)]),
    tarifa_diurna_central: new FormControl(0, [Validators.required]),
    tarifa_nocturna_central: new FormControl(0, [Validators.required]),
    img_central: new FormControl(''),
    estado: new FormControl(''),
    presidente: new FormControl(''),
  });

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });

    // Obtener usuario del local storage
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    await this.getPresidentes();

    // Obtener el ID de la URL
    await this.route.params.subscribe(async params => {
      const id = params['id'];
      console.log('ID recibido:', id);

      try {
        // Obtener el usuario con el ID desde Firebase
        const centralObtenida = await this.firebaseSvc.getDocument(`central_colectivo/${id}`);
        const comunaObtenida = await this.firebaseSvc.getDocument(`comuna/${centralObtenida['comuna']}`);
        const presidenteObtenido = await this.firebaseSvc.getDocument(`usuario/${centralObtenida['presidente']}`);

        // Aquí puedes hacer lo que necesites con el usuario obtenido, por ejemplo, mostrarlo en el formulario
        this.central = centralObtenida;
        this.comuna = comunaObtenida;
        this.presidente = presidenteObtenido

        this.form.patchValue({
          nombre_central: centralObtenida['nombre_central'],
          tarifa_diurna_central: centralObtenida['tarifa_diurna_central'],
          tarifa_nocturna_central: centralObtenida['tarifa_nocturna_central'],
          img_central: centralObtenida['img_central'],
          estado: centralObtenida['estado'],
          presidente: centralObtenida['presidente']
        });

      } catch (error) {
        console.error('Error al obtener los datos desde Firebase:', error);
        this.utilsSvc.presentToast({
          message: 'Error al obtener los datos de la central.',
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      }
    });
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        // Actualizar la información del usuario en Firebase

        if (this.form.value.img_central !== this.central.img_central) {
          //Si la imagen es default, entonces creará una nueva cosa en el storage para evitar errores
          if (this.central.img_central == '') {
            let imagePath = `centra_colectivo/${this.central.id}}/${Date.now()}`;
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_central);
            this.form.controls.img_central.setValue(imageUrl)
          } else {
            let imagePath = await this.firebaseSvc.getFilePath(this.central.img_central);
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_central);
            this.form.controls.img_central.setValue(imageUrl)
          }

          this.central.img_central = this.form.value.img_central
        }

        if(this.form.value.presidente !== this.presidente.uid){
          await this.firebaseSvc.updateDocument(`usuario/${this.presidente.uid}`, { central: '' });
          const presidenteObtenido = await this.firebaseSvc.getDocument(`usuario/${this.form.value.presidente}`);
          this.presidente = presidenteObtenido
        }

        await this.firebaseSvc.updateDocument(`central_colectivo/${this.central.id}`, this.form.value);
        this.central = {...this.central, ...this.form.value}

        // Rellenar el formulario con los datos del usuario autenticado
        this.form.patchValue({
          nombre_central: this.central.nombre_central,
          tarifa_diurna_central: this.central.tarifa_diurna_central,
          tarifa_nocturna_central: this.central.tarifa_nocturna_central,
          img_central: this.central.img_central,
          estado: this.central.estado,
          presidente: this.central.presidente
        });

        await this.firebaseSvc.updateDocument(`usuario/${this.central.presidente}`, { central: this.central.id });
        
        this.utilsSvc.routerLink('main/owner/central');
        this.utilsSvc.presentToast({
          message: 'Central actualizada con éxito.',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.error('Error actualizando la Central:', error);
        this.utilsSvc.presentToast({
          message: 'Error al actualizar la Central. Inténtalo de nuevo.',
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

  async getPresidentes() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const usuarioPath = 'usuario'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [usuarios] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]>
      ]);

      // Filtrar los resultados para obtener solo los choferes de la misma central
      this.presidentes = usuarios.filter(usuario => usuario.tipo_usuario == '1'
      );

      if (this.presidentes.length > 0) {
        this.utilsSvc.presentToast({
          message: 'Presidentes Cargados con Éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        this.utilsSvc.presentToast({
          message: 'No hay Presidentes disponibles',
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

  async takeImage() {
    const dataUrl = (await this.utilsSvc.takePicture('Logo de la Central')).dataUrl;
    this.form.controls.img_central.setValue(dataUrl);
  }
}

