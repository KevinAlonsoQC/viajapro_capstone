import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Pais } from 'src/app/models/pais';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { validarRut, limpiarRut } from "validar-rut-chile";
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  public pais: Pais[];
  public tipo_usuario: TipoUsuario[];

  public imagenCargando = false;
  public imagenBase64 = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    rut_usuario: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    telefono_usuario: new FormControl(0, [Validators.required]),
    img_usuario: new FormControl(''),
    coordenadas_usuario: new FormControl(''),
    tipo_usuario: new FormControl('', [Validators.required]),
    pais: new FormControl('', [Validators.required]),
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  async ngOnInit() {
    await this.getInfoAndTipoCuenta();
  }

  async submit() {
    this.validarIngresoRut(this.form.controls.rut_usuario);
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
      this.firebaseSvc.signUp(this.form.value as User).then(async res => {
        await this.firebaseSvc.updateProfile(this.form.value.name)
        let uid = res.user.uid
        this.form.controls.uid.setValue(uid);
        this.setUserInfo(uid);
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
          message: 'Las credenciales son incorrectas',
          duration: 3500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async setUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `usuario/${uid}`
      delete this.form.value.password;

      this.firebaseSvc.setDocument(path, this.form.value).then(async res => {
        this.utilsSvc.saveInLocalStorage('usuario', this.form.value)
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
          message: 'Las credenciales son incorrectas',
          duration: 3500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async getInfoAndTipoCuenta() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    const paisPath = 'pais';
    const tipoUsuarioPath = 'tipo_usuario';

    try {
      // Ejecutar ambas promesas en paralelo
      const [pais, tipo_usuario] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(paisPath) as Promise<Pais[]>,
        this.firebaseSvc.getCollectionDocuments(tipoUsuarioPath) as Promise<TipoUsuario[]>
      ]);

      // Capturar el objeto con id 0 (convertir id a número si es string)
      const tipoUsuarioId0 = tipo_usuario.find(t => Number(t.id) === 0);

      // Filtrar los resultados para eliminar el tipo_usuario con id 0
      this.tipo_usuario = tipo_usuario.filter(t => Number(t.id) !== 0);

      // Asignar los resultados
      this.pais = pais;

      console.log(this.pais);
      console.log(this.tipo_usuario);

      // Si deseas hacer algo con el tipo_usuario de id 0, puedes usarlo aquí
      if (tipoUsuarioId0) {
        console.log('Tipo de usuario con id 0:', tipoUsuarioId0);
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 3500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  validarRut(rut: string): boolean {
    console.log(validarRut(rut))
    return validarRut(rut);
  }

  validarIngresoRut(control: AbstractControl): void {
    if (control.value && !this.validarRut(control.value)) {
      control.setErrors({ invalidRut: true });
    } else {
      control.setErrors(null);
    }
  } 

  cargarFoto(e: Event){
    this.imagenCargando = true;
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(archivo);
    reader.onload = () => {
      this.imagenCargando = false;
      this.imagenBase64 = reader.result as string;
    }
  }
}
