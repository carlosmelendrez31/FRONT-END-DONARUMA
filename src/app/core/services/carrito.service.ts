import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Ajusta el puerto 7030 si tu Swagger dice uno diferente
  private apiUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 
  private _carrito: any[] = []; // Store cart state

  constructor(private http: HttpClient) { }

  // Establecer el carrito desde el componente Inicio
  setCarrito(items: any[]) {
    this._carrito = items;
  }

  // Obtener el carrito en el componente Carrito
  getCarrito() {
    return this._carrito;
  }

  // Esta función manda el carrito a tu Back-End
  procesarPagoStripe(carrito: any[]) {
    return this.http.post(this.apiUrl, carrito);
  }
}