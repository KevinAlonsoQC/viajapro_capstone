import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modificar-presidente',
  templateUrl: './modificar-presidente.page.html',
  styleUrls: ['./modificar-presidente.page.scss'],
})
export class ModificarPresidentePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuario!: User;
  presidente!: any;
  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono_usuario: new FormControl(0, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
    img_usuario: new FormControl(''),
  });

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario para recibir actualizaciones en tiempo real
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
  
    // Obtener el ID de la URL y manejar la lógica correspondiente
    this.route.params.subscribe(async params => {
      const id = params['id'];
      console.log('ID recibido:', id);
  
      try {
        // Obtener el usuario desde Firebase con el ID
        const usuarioObtenido = await this.firebaseSvc.getDocument(`usuario/${id}`);
  
        // Verificar si el usuario obtenido es válido y pertenece a la misma "central"
        if (usuarioObtenido && usuarioObtenido['tipo_usuario'] === '1' && this.usuario.tipo_usuario === '0') {
          console.log('Usuario válido:', usuarioObtenido);
          this.presidente = usuarioObtenido;
  
          // Actualizar el formulario con los datos del usuario
          this.form.patchValue({
            name: usuarioObtenido['name'],
            email: usuarioObtenido['email'],
            telefono_usuario: usuarioObtenido['telefono_usuario'],
            img_usuario: usuarioObtenido['img_usuario'],
          });
        } else {
          // Mostrar un mensaje de error si el usuario no tiene permisos
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
        // Manejar errores al obtener los datos del usuario
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

        if (this.form.value.img_usuario !== this.presidente.img_usuario) {
          //Si la imagen es default, entonces creará una nueva cosa en el storage para evitar errores
          if (this.presidente.img_usuario == 'https://ionicframework.com/docs/img/demos/avatar.svg' || this.presidente.img_usuario == '') {
            let imagePath = `usuario/${this.presidente.uid}}/${Date.now()}`;
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_usuario);
            this.form.controls.img_usuario.setValue(imageUrl)
          } else {
            let imagePath = await this.firebaseSvc.getFilePath(this.presidente.img_usuario);
            let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_usuario);
            this.form.controls.img_usuario.setValue(imageUrl)
          }

          this.presidente.img_usuario = this.form.value.img_usuario
        }

        await this.firebaseSvc.updateDocument(`usuario/${this.presidente.uid}`, this.form.value);
        this.presidente = {...this.presidente, ...this.form.value}

        // Rellenar el formulario con los datos del usuario autenticado
        this.form.patchValue({
          name: this.presidente.name,
          email: this.presidente.email,
          telefono_usuario: this.presidente.telefono_usuario,
          img_usuario: this.presidente.img_usuario,
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
