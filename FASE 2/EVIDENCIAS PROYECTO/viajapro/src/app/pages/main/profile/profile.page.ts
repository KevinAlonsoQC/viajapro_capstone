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
  editPicture:boolean;

  // Formulario solo para editar nombre, email y teléfono
  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono_usuario: new FormControl(0, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
  });

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    
    // Rellenar el formulario con los datos del usuario
    this.form.patchValue({
      name: this.usuario.name,
      email: this.usuario.email,
      telefono_usuario: this.usuario.telefono_usuario,
    });

    this.usuario.img_usuario = "https://img.freepik.com/fotos-premium/retrato-hombre-negocios-expresion-cara-seria-fondo-estudio-espacio-copia-behttps://img.freepik.com/fotos-premium/retrato-hombre-negocios-expresion-cara-seria-fondo-estudio-espacio-copia-bengala-persona-corporativa-enfoque-pensamiento-duda-mirada-facial-dilema-o-concentracion_590464-84924.jpg"
    this.editPicture = true;
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
  
      try {
        // Actualizar la información del usuario en Firebase
        await this.firebaseSvc.updateDocument(`usuario/${this.usuario.uid}`, this.form.value);
        this.utilsSvc.presentToast({
          message: 'Perfil actualizado con éxito.',
          duration: 3500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
  
        // Actualizar los datos en el local storage
        const updatedUser = { ...this.usuario, ...this.form.value };
        this.utilsSvc.saveInLocalStorage('usuario', updatedUser);
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

  signOut() {
    this.firebaseSvc.signOut();
  }
}
