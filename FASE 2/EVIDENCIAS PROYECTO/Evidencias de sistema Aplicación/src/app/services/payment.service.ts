import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getMessaging, onMessage } from "firebase/messaging";
import { AlertController } from '@ionic/angular';
import { initializeApp, getApps } from "firebase/app";
import { environment } from '../../environments/environment'; // Asegúrate de tener tu configuración de Firebase aquí

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'https://payment-api.khipu.com/v3/payments'; // Cambia esto a tu URL real

  constructor(private http: HttpClient) {}

  // Método para crear un pago
  createPayment(amount: number, currency: string, subject: string, api_key: string): Observable<any> {
    // Obtiene la fecha y hora actual
    const now = new Date();
    // Agrega 3 minutos
    now.setMinutes(now.getMinutes() + 2);
    // Formatea la fecha en formato ISO-8601 para `expires_date`
    const expiresDate = now.toISOString();
    const headers = {
      'x-api-key': api_key,
      'Content-Type': 'application/json',
    };
    const paymentData = {
      amount,
      currency,
      subject,
      expires_date: expiresDate,
    };
    return this.http.post(this.apiUrl, paymentData, { headers });
  }

  // Método para obtener un pago
  getPayment(api_key: string, id: string): Observable<any> {
    const headers = {
      'x-api-key': api_key,
      'Content-Type': 'application/json',
    };

    return this.http.get(`https://payment-api.khipu.com/v3/payments/${id}`, { headers });
  }
}
