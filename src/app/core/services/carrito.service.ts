import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // 👈 Súper importante para la Base de Datos

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // 1. La URL para los pagos (la que ya tenías)
  private stripeUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 
  
  // 2. 🚀 NUEVA URL para tu base de datos de carritos en C#
  private carritoApiUrl = 'https://localhost:7030/api/Carrito'; 

  // Variable temporal por si la página de pagos aún la necesita
  private _carrito: any[] = []; 

  constructor(private http: HttpClient) { 
    // Ya no leemos del localStorage aquí, porque ahora lo sacaremos de PostgreSQL
  }

  // ==========================================
  // 🚀 FUNCIONES PRO PARA LA BASE DE DATOS
  // ==========================================

  // 1. GUARDAR EN BASE DE DATOS (El POST)
  agregarAlCarritoBD(idUsuario: number, idPerfume: number, cantidad: number): Observable<any> {
    const payload = {
      idUsuario: idUsuario,
      idPerfume: idPerfume,
      cantidad: cantidad
    };
    return this.http.post(`${this.carritoApiUrl}/agregar`, payload);
  }

  // 2. LEER DE LA BASE DE DATOS (El GET)
  obtenerCarritoBD(idUsuario: number): Observable<any> {
    return this.http.get(`${this.carritoApiUrl}/usuario/${idUsuario}`);
  }

  // 3. ELIMINAR DE LA BASE DE DATOS (El DELETE)
  eliminarItemBD(idCarritoItem: number): Observable<any> {
    return this.http.delete(`${this.carritoApiUrl}/eliminar/${idCarritoItem}`);
  }


  // ==========================================
  // 💳 FUNCIONES PARA STRIPE (Tus funciones originales)
  // ==========================================

  setCarrito(items: any[]) {
    this._carrito = items;
    // Lo dejamos en localStorage temporalmente solo para que tu página de Stripe no explote
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

    return this.http.post(this.stripeUrl, payloadCheckout);
  }
}