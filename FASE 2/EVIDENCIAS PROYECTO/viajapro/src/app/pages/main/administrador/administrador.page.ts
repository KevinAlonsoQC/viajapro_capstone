import { Component, OnInit, inject } from '@angular/core';
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
  usuario: any;

  constructor() { }

  ngOnInit() {
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    console.log(this.usuario)
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

}
