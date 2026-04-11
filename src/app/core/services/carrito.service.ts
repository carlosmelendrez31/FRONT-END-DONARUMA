import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 
  private _carrito: any[] = []; 

  constructor(private http: HttpClient) { 
    // 1. EL ANTÍDOTO DEL CARRITO FANTASMA 👻
    // Cuando Angular arranca, buscamos en la memoria si ya había perfumes guardados
    const carritoGuardado = localStorage.getItem('carrito_dunaroma');
    if (carritoGuardado) {
      this._carrito = JSON.parse(carritoGuardado);
    }
  }

  // 2. ACTUALIZAR EL CARRITO Y GUARDAR EN MEMORIA
  setCarrito(items: any[]) {
    this._carrito = items;
    // Cada vez que agregues algo, lo guardamos en el "disco duro" del navegador
    localStorage.setItem('carrito_dunaroma', JSON.stringify(this._carrito));
  }

  // 3. OBTENER LOS PERFUMES ACTUALES
  getCarrito() {
    return this._carrito;
  }

  // 4. EL PUENTE A C# Y STRIPE 💳
  procesarPagoStripe() {
    // Transformamos tu carrito al molde exacto que configuramos en C# ({ items: [...] })
    const payloadCheckout = {
      items: this._carrito.map((item: any) => ({
        nombre: item.nombre, // Si tu variable de nombre se llama distinto (ej. 'name'), cámbialo aquí
        precio: item.precio, // Igual aquí
        cantidad: item.cantidad || 1 // Si no tienes variable 'cantidad', asume 1 por defecto
      }))
    };

    // Mandamos el paquete ya armado a tu Back-End
    return this.http.post(this.apiUrl, payloadCheckout);
  }
}
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
