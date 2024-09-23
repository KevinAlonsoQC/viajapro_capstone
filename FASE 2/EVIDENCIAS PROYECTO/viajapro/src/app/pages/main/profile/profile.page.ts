import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { inject } from '@angular/core';
import { User } from 'src/app/models/user';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  editPicture:boolean;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.usuario = this.utilsSvc.getFromLocalStorage('usuario');
    this.usuario.img_usuario = "https://img.freepik.com/fotos-premium/retrato-hombre-negocios-expresion-cara-seria-fondo-estudio-espacio-copia-behttps://img.freepik.com/fotos-premium/retrato-hombre-negocios-expresion-cara-seria-fondo-estudio-espacio-copia-bengala-persona-corporativa-enfoque-pensamiento-duda-mirada-facial-dilema-o-concentracion_590464-84924.jpg"
    this.editPicture = true;
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

}
