import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
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

}
