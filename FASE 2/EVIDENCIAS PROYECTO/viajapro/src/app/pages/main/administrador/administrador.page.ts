import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.page.html',
  styleUrls: ['./administrador.page.scss'],
})
export class AdministradorPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
  constructor() { }

  ngOnInit() {
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    //URL de Prueba ****
    this.usuario.img_usuario = "https://img.freepik.com/fotos-premium/retrato-hombre-negocios-expresion-cara-seria-fondo-estudio-espacio-copia-behttps://img.freepik.com/fotos-premium/retrato-hombre-negocios-expresion-cara-seria-fondo-estudio-espacio-copia-bengala-persona-corporativa-enfoque-pensamiento-duda-mirada-facial-dilema-o-concentracion_590464-84924.jpg"
    this.userId = this.usuario.uid;
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

}
