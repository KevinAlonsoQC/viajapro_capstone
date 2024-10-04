import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonModal } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.page.html',
  styleUrls: ['./conductores.page.scss'],
})
export class ConductoresPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  isOpen:boolean=false;
  isOpen2:boolean=false;
  isOpen3:boolean=false;
  usuario!: User;

  

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono_usuario: new FormControl(0, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
  });

  constructor() { }

  recibirMensaje(mensaje: boolean) {
    this.isOpen = mensaje;
  }

  recibirMensaje2(mensaje: boolean) {
    this.isOpen3 = mensaje;
  }
  
  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    
    // Rellenar el formulario con los datos del usuario
    this.form.patchValue({
      name: this.usuario.name,
      email: this.usuario.email,
      telefono_usuario: this.usuario.telefono_usuario,
    });
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


}
