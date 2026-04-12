import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 
  private _carrito: any[] = []; 

  constructor(private http: HttpClient) { 
    const carritoGuardado = localStorage.getItem('carrito_dunaroma');
    if (carritoGuardado) {
      this._carrito = JSON.parse(carritoGuardado);
    }
  }

  setCarrito(items: any[]) {
    this._carrito = items;
    localStorage.setItem('carrito_dunaroma', JSON.stringify(this._carrito));
  }

  getCarrito() {
    return this._carrito;
  }

  procesarPagoStripe() {
    // 📦 Volvemos a meter todo en la caja "items"
    const payloadCheckout = {
      items: this._carrito.map((item: any) => ({
        nombre: item.nombre, 
        precio: item.precio, 
        cantidad: item.cantidad || 1 
      }))
    };

    return this.http.post(this.apiUrl, payloadCheckout);
  }
}