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
  administracion:boolean;
  constructor() { }
  

  ngOnInit() {
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    //URL de Prueba ****
    this.userId = this.usuario.uid;
  }

  profile(){
    this.utilsSvc.routerLink('/main/profile');
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  onClickAd(){
    this.administracion = true;
  }

}
