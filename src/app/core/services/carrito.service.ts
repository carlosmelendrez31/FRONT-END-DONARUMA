import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  procesarPagoStripe(direccion: string, perfumesIds: number[], cantidades: number[]) {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const body = {
      Direccion: direccion,
      PerfumesIds: perfumesIds,
      Cantidades: cantidades
    };
    return this.http.post(this.apiUrl, body, { headers });
  }

  confirmarPago(sessionId: string) {
    const url = `https://localhost:7030/api/pagos/confirmar?session_id=${sessionId}`;
    return this.http.get(url);
  }
}