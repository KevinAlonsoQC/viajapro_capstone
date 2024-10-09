import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modificar-conductor',
  templateUrl: './modificar-conductor.page.html',
  styleUrls: ['./modificar-conductor.page.scss'],
})
export class ModificarConductorPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  chofer!: any;
  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono_usuario: new FormControl(0, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
    img_usuario: new FormControl('')
  });

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });

    // Obtener usuario del local storage
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');

    // Obtener el ID de la URL
    await this.route.params.subscribe(async params => {
      const id = params['id'];
      console.log('ID recibido:', id);

      try {
        // Obtener el usuario con el ID desde Firebase
        const usuarioObtenido = await this.firebaseSvc.getDocument(`usuario/${id}`);

        // Verificar si el usuario obtenido pertenece a la misma "central" y si es un chofer
        if (usuarioObtenido && usuarioObtenido['central'] === this.usuario.central && usuarioObtenido['tipo_usuario'] === '2') {
          console.log('Usuario válido:', usuarioObtenido);
          this.chofer = usuarioObtenido;

          // Aquí puedes hacer lo que necesites con el usuario obtenido, por ejemplo, mostrarlo en el formulario
          this.form.patchValue({
            name: usuarioObtenido['name'],
            email: usuarioObtenido['email'],
            telefono_usuario: usuarioObtenido['telefono_usuario'],
            img_usuario: usuarioObtenido['img_usuario']
          });
        } else {
          console.error('Error: El usuario no tiene los permisos necesarios o no pertenece a la misma central.');
          this.utilsSvc.presentToast({
            message: 'No tienes permiso para acceder a este usuario.',
            duration: 1500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        }
      } catch (error) {
        console.error('Error al obtener el usuario desde Firebase:', error);
        this.utilsSvc.presentToast({
          message: 'Error al obtener los datos del usuario.',
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

        if (this.form.value.img_usuario !== this.chofer.img_usuario) {
          //Si la imagen es default, entonces creará una nueva cosa en el storage para evitar errores
          if (this.chofer.img_usuario == 'https://ionicframework.com/docs/img/demos/avatar.svg' || this.chofer.img_usuario == '') {
            let imagePath = `usuario/${this.chofer.uid}}/${Date.now()}`;
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_usuario);
            this.form.controls.img_usuario.setValue(imageUrl)
          } else {
            let imagePath = await this.firebaseSvc.getFilePath(this.chofer.img_usuario);
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_usuario);
            this.form.controls.img_usuario.setValue(imageUrl)
          }

          this.chofer.img_usuario = this.form.value.img_usuario
        }

        await this.firebaseSvc.updateDocument(`usuario/${this.chofer.uid}`, this.form.value);
        this.chofer = {...this.chofer, ...this.form.value}

        // Rellenar el formulario con los datos del usuario autenticado
        this.form.patchValue({
          name: this.chofer.name,
          email: this.chofer.email,
          telefono_usuario: this.chofer.telefono_usuario,
          img_usuario: this.chofer.img_usuario
        });

        this.utilsSvc.presentToast({
          message: 'Perfil actualizado con éxito.',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.error('Error actualizando perfil:', error);
        this.utilsSvc.presentToast({
          message: 'Error al actualizar el perfil. Inténtalo de nuevo.',
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

  async takeImage() {
    const dataUrl = (await this.utilsSvc.takePicture('Foto de Perfil')).dataUrl;
    this.form.controls.img_usuario.setValue(dataUrl);
  }
}
