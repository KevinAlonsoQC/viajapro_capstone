import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario!: User; // Añadido el operador de no-null assertion
  userId: string;

  // Formulario solo para editar nombre, email y teléfono
  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono_usuario: new FormControl(0, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
    img_usuario: new FormControl(''),
  });

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');

    // Rellenar el formulario con los datos del usuario
    this.form.patchValue({
      name: this.usuario.name,
      email: this.usuario.email,
      telefono_usuario: this.usuario.telefono_usuario,
      img_usuario: this.usuario.img_usuario
    });
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        // Actualizar la información del usuario en Firebase

        if (this.form.value.img_usuario !== this.usuario.img_usuario) {
          let imagePath = await this.firebaseSvc.getFilePath(this.usuario.img_usuario);
          let imageUrl = await this.firebaseSvc.uploadImage(imagePath, this.form.value.img_usuario);
          this.form.controls.img_usuario.setValue(imageUrl)
          this.usuario.img_usuario = this.form.value.img_usuario
        }

        await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, this.form.value);
        // Actualizar los datos en el local storage
        const updatedUser = { ...this.usuario, ...this.form.value };
        this.utilsSvc.saveInLocalStorage('usuario', updatedUser);
        // Reflejar los cambios en la variable `usuario` del componente
        this.usuario = updatedUser; // Actualiza la variable `usuario` para reflejar los cambios en la vista


        this.utilsSvc.presentToast({
          message: 'Perfil actualizado con éxito.',
          duration: 3500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.error('Error actualizando perfil:', error);
        this.utilsSvc.presentToast({
          message: 'Error al actualizar el perfil. Inténtalo de nuevo.',
          duration: 3500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }


  backAdmin() {
    this.utilsSvc.routerLink('/main/administrador');
  }

  async takeImage() {
    const dataUrl = (await this.utilsSvc.takePicture('Foto de Perfil')).dataUrl;
    this.form.controls.img_usuario.setValue(dataUrl);
  }

  signOut() {
    this.firebaseSvc.signOut();
  }
}
