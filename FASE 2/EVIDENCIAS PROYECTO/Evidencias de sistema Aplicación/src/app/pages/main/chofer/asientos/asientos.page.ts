import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-asientos',
  templateUrl: './asientos.page.html',
  styleUrls: ['./asientos.page.scss'],
})
export class AsientosPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;

  constructor() { }

  async ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  backAdmin() {
    this.utilsSvc.routerLink('/main/chofer/en-ruta');
  }

  async cambiarAsiento(asiento: number){

  }
}
