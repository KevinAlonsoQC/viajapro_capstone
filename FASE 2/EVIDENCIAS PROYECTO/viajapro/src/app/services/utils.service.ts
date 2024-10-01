import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadinCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);

  // Se puede agregar un BehaviorSubject para cada tipo de dato si es necesario
  private dataSubjects: { [key: string]: BehaviorSubject<any> } = {};

  constructor() {
    // Inicializa un BehaviorSubject para 'usuario'
    this.dataSubjects['usuario'] = new BehaviorSubject<User | null>(null);
  }

  loading() {
    return this.loadinCtrl.create({ spinner: 'crescent' });
  }

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  // ===== Para almacenar y obtener datos de localstorage =====
  saveInLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
    // Actualiza el BehaviorSubject correspondiente si existe
    if (this.dataSubjects[key]) {
      this.dataSubjects[key].next(value);
    }
  }

  getFromLocalStorage(key: string) {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    // Actualiza el BehaviorSubject si existe
    if (this.dataSubjects[key] && data) {
      this.dataSubjects[key].next(data);
    }
    return data;
  }

  // ==== Para sacar Fotografías ====
  async takePicture(promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Selecciona una Imagen',
      promptLabelPicture: 'Toma una Foto',
    });
  }

  // Método para obtener el observable de un BehaviorSubject específico
  getDataObservable(key: string) {
    return this.dataSubjects[key]?.asObservable();
  }
}
