import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PaymentService } from '../../../services/payment.service'; 

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;

  
  constructor(private paymentService: PaymentService) { 
    
  }

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');

    
  }

  profile(){
    this.utilsSvc.routerLink('/main/profile');
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  startKhipuPayment() {
    const amountt = 900; // Monto del pago
    const currency = 'CLP'; // Monto del pago
    const subject = 'Prueba'; // Monto del pago

    const api_key = "49c65a51-5874-4471-beaa-a2891b385026"

    this.paymentService.createPayment(amountt,currency,subject,api_key).subscribe(
      (response) => {
        this.openExternalLink(response.payment_url)
       
      }
    )
    
  }

  openExternalLink(url:string) {
    window.open(url, '_blank');
  }

 
}
