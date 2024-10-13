import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'https://payment-api.khipu.com/v3/payments'; // Cambia esto a tu URL real

  constructor(private http: HttpClient) {}

  
  // Método para crear un pago
  createPayment(amount: number, currency:string,subject:string,api_key:string): Observable<any> {
    
    const headers = {
      'x-api-key': api_key,
      'Content-Type': 'application/json',
    };

    const paymentData = {
      amount,
      currency,
      subject
    };

    return this.http.post(this.apiUrl, paymentData,{headers});
  }

}
