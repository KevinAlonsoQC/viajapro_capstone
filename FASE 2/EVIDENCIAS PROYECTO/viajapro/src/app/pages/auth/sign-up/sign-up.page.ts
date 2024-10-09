import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Pais } from 'src/app/models/pais';
import { TipoUsuario } from 'src/app/models/tipo-usuario';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  public pais: Pais[];
  public tipo_usuario: TipoUsuario[];

  public imagenDefault = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xNzY1XzcwNTUpIj4KPHBhdGggZD0iTTAgMEg1MTJWNTEySDBWMFoiIGZpbGw9IiMyMjJEM0EiLz4KPHBhdGggZD0iTTMzMC4wODUgMTEwLjk1NUMzMTEuMjk5IDkwLjY3MiAyODUuMDU5IDc5LjUwMjQgMjU2LjA5NyA3OS41MDI0QzIyNi45ODEgNzkuNTAyNCAyMDAuNjU1IDkwLjYwNDQgMTgxLjk1NSAxMTAuNzYyQzE2My4wNTMgMTMxLjE0MSAxNTMuODQzIDE1OC44MzggMTU2LjAwNSAxODguNzQ2QzE2MC4yOTIgMjQ3Ljc1MSAyMDUuMTkyIDI5NS43NSAyNTYuMDk3IDI5NS43NUMzMDcuMDAzIDI5NS43NSAzNTEuODI2IDI0Ny43NiAzNTYuMTggMTg4Ljc2NUMzNTguMzcxIDE1OS4xMjggMzQ5LjEwMyAxMzEuNDg5IDMzMC4wODUgMTEwLjk1NVoiIGZpbGw9IiNCM0JBQzAiLz4KPHBhdGggZD0iTTUzLjkyNzUgNTExLjk5N0g0NTguMzMzQzQ1OSA1MDMgNDU4LjIwNiA0ODMuNDk5IDQ1Ni4zMzMgNDczLjE0MUM0NDguMTg1IDQyNy45NDEgNDIyLjc1NyAzODkuOTcyIDM4Mi43ODkgMzYzLjMyN0MzNDcuMjgyIDMzOS42NzUgMzAyLjMwNSAzMjYuNjQyIDI1Ni4xMyAzMjYuNjQyQzIwOS45NTYgMzI2LjY0MiAxNjQuOTc4IDMzOS42NjYgMTI5LjQ3MSAzNjMuMzI3Qzg5LjUwMzggMzg5Ljk4MiA2NC4wNzU0IDQyNy45NTEgNTUuOTI3NSA0NzMuMTVDNTQuMDU0NiA0ODMuNTA5IDUzLjUwMDEgNTA0LjUgNTMuOTI3NSA1MTEuOTk3WiIgZmlsbD0iI0IzQkFDMCIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE3NjVfNzA1NSI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=';

  //variable protegida para uso interno
  private ruts_usados: any;

  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    rut_usuario: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    telefono_usuario: new FormControl(0, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
    img_usuario: new FormControl(this.imagenDefault),
    coordenadas_usuario: new FormControl(''),
    tipo_usuario: new FormControl('', [Validators.required]),
    pais: new FormControl('', [Validators.required]),
    central: new FormControl(''),
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  async ngOnInit() {
    await this.getInfoAndTipoCuenta();
    this.form.controls.img_usuario.setValue(this.imagenDefault);
  }

  async submit() {
    const rutIngresado = this.form.controls.rut_usuario.value;

    // Obtener los RUTs usados desde Firebase
    let ruts_usados: string[] = [];
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      this.validarIngresoRut(this.form.controls.rut_usuario);

      if (!this.validarRut(this.form.value.rut_usuario)) {
        this.utilsSvc.presentToast({
          message: 'El RUT ingresado no existe.',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        return;
      }
      // Obtener los RUTs usados de Firebase
      const usuarios = await this.firebaseSvc.getCollectionDocuments('usuario') as any[];
      ruts_usados = usuarios.map(user => user.rut_usuario);

      // Validar si el RUT ingresado ya está en uso
      if (ruts_usados.includes(rutIngresado)) {
        this.form.controls.rut_usuario.setErrors({ rutEnUso: true });
        this.utilsSvc.presentToast({
          message: 'El RUT ingresado ya está en uso.',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        return;
      }
  
      if (this.form.valid) {
        this.form.value.coordenadas_usuario = '';
        this.firebaseSvc.signUp(this.form.value as User).then(async res => {
          console.log('Datos enviados a Firebase:', this.form.value);  // Asegúrate de que aún sea base64
          await this.firebaseSvc.updateProfile(this.form.value.name);
          let uid = res.user.uid;
          this.form.controls.uid.setValue(uid);
          this.setUserInfo(uid);
        }).catch(error => {
          console.log(error);
          this.utilsSvc.presentToast({
            message: '¡Este correo está en uso!',
            duration: 1500,
            color: 'primary',
            position: 'middle',
            icon: 'alert-circle-outline'
          });
        }).finally(() => {
          loading.dismiss();
        });
      }
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener la información de RUTs usados.',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }


  async setUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `usuario/${uid}`
      let imagePath = `usuario/${uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath,  this.form.value.img_usuario);
      this.form.controls.img_usuario.setValue(imageUrl)
      delete this.form.value.password;

      this.firebaseSvc.setDocument(path, this.form.value).then(async res => {
        this.utilsSvc.saveInLocalStorage('usuario', this.form.value)
        this.utilsSvc.routerLink('/main');
        this.form.reset();
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
          message: 'Las credenciales son incorrectas',
          duration: 1500,
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
    const usuarioPath = 'usuario'; // Ruta de la colección de usuarios

    try {
      // Ejecutar ambas promesas en paralelo
      const [pais, tipo_usuario, usuarios] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(paisPath) as Promise<Pais[]>,
        this.firebaseSvc.getCollectionDocuments(tipoUsuarioPath) as Promise<TipoUsuario[]>,
        this.firebaseSvc.getCollectionDocuments(usuarioPath) as Promise<any[]> // Cambia 'any' por el tipo adecuado si lo tienes
      ]);

      // Filtrar los resultados para eliminar el tipo_usuario con id 0
      this.tipo_usuario = tipo_usuario.filter(t => Number(t.id) !== 0);
      this.pais = pais;
      // Extraer ruts_usados de los documentos de usuarios
      this.ruts_usados = usuarios.map(user => user.rut_usuario).filter(rut => rut);

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

  // Función para validar un RUT chileno
  validarRut(rut: string): boolean {
    // Eliminar puntos y guion del RUT
    const cleanedRut = rut.replace(/[.\-]/g, '');

    // Verificar que el RUT tiene al menos 8 dígitos y un dígito verificador
    if (cleanedRut.length < 9) {
      return false;
    }

    // Separar el cuerpo del dígito verificador
    const cuerpo = cleanedRut.slice(0, -1);
    const dv = cleanedRut.slice(-1).toUpperCase();

    // Calcular el dígito verificador
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = (multiplo === 7) ? 2 : multiplo + 1;
    }

    const dvCalculado = 11 - (suma % 11);
    const dvEsperado = (dvCalculado === 11) ? '0' : (dvCalculado === 10) ? 'K' : dvCalculado.toString();

    // Comparar el dígito verificador calculado con el ingresado
    return dv === dvEsperado;
  }

  // Método para validar el RUT
  validarIngresoRut(control: AbstractControl): void {
    const rutValue = control.value;

    // Expresión regular para verificar el formato 20981146-4
    const rutPattern = /^[0-9]{8}-[0-9Kk]$/;

    if (rutValue && !rutPattern.test(rutValue)) {
      control.setErrors({ invalidRut: true });
    } else {
      control.setErrors(null);
    }
  }

  async takeImage(){
    const dataUrl = (await this.utilsSvc.takePicture('Foto de Perfil')).dataUrl;
    this.form.controls.img_usuario.setValue(dataUrl);
  }
}
