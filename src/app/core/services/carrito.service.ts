import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Ajusta el puerto 7030 si tu Swagger dice uno diferente
  private apiUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 

  constructor(private http: HttpClient) { }

  // Esta función manda el carrito a tu Back-End
  procesarPagoStripe(carrito: any[]) {
    return this.http.post(this.apiUrl, carrito);
  }
}