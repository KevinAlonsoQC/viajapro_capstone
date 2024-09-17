import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-chofer',
  templateUrl: './chofer.page.html',
  styleUrls: ['./chofer.page.scss'],
})
export class ChoferPage implements OnInit {

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
