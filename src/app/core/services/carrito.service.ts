import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 
  private stripeUrl = 'https://localhost:7030/api/Pagos/crear-sesion'; 
  private carritoApiUrl = 'https://localhost:7030/api/Carrito'; 
  private _carrito: any[] = []; 

  constructor(private http: HttpClient) { }

  setCarrito(items: any[]) {
    this._carrito = items;
    localStorage.setItem('carrito_dunaroma', JSON.stringify(this._carrito));
  }

  getCarrito() {
    return this._carrito;
  }

  agregarAlCarritoBD(idUsuario: number, idPerfume: number, cantidad: number): Observable<any> {
    const payload = {
      idUsuario: idUsuario,
      idPerfume: idPerfume,
      cantidad: cantidad
    };
    return this.http.post(`${this.carritoApiUrl}/agregar`, payload);
  }

  obtenerCarritoBD(idUsuario: number): Observable<any> {
    return this.http.get(`${this.carritoApiUrl}/usuario/${idUsuario}`);
  }

  eliminarItemBD(idCarritoItem: number): Observable<any> {
    return this.http.delete(`${this.carritoApiUrl}/eliminar/${idCarritoItem}`);
  }

  procesarPagoStripe(direccion?: string, perfumesIds?: number[], cantidades?: number[]) {
    const token = localStorage.getItem('accessToken');
    let headers;
    if (token) {
        headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }
    
    if (direccion && perfumesIds && cantidades) {
      const body = {
        Direccion: direccion,
        PerfumesIds: perfumesIds,
        Cantidades: cantidades
      };
      return this.http.post(this.apiUrl, body, { headers });
    } else {
        const payloadCheckout = {
            items: this._carrito.map((item: any) => ({
              nombre: item.nombre, 
              precio: item.precio, 
              cantidad: item.cantidad || 1 
            }))
        };
        return this.http.post(this.stripeUrl, payloadCheckout, { headers });
    }
  }

  confirmarPago(sessionId: string) {
    const url = `https://localhost:7030/api/pagos/confirmar?session_id=${sessionId}`;
    return this.http.get(url);
  }
}
