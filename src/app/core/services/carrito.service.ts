import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private stripeUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Pagos/crear-sesion'; 
  private carritoApiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Carrito'; 

  // 🔄 Nuestra memoria temporal (RAM). Cuando el usuario cierra la pestaña, esto desaparece.
  private _carrito = new BehaviorSubject<any[]>([]);
  public carrito$ = this._carrito.asObservable();

  constructor(private http: HttpClient) { }

  // ==========================================
  // 🚀 FUNCIONES PARA LA BASE DE DATOS
  // ==========================================

  agregarAlCarritoBD(idUsuario: number, idPerfume: number, cantidad: number): Observable<any> {
    const payload = { idUsuario, idPerfume, cantidad };
    return this.http.post(`${this.carritoApiUrl}/agregar`, payload, { withCredentials: true });
  }

  obtenerCarritoBD(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.carritoApiUrl}/usuario/${idUsuario}`, { withCredentials: true });
  }

  eliminarItemBD(idCarritoItem: number): Observable<any> {
    return this.http.delete(`${this.carritoApiUrl}/eliminar/${idCarritoItem}`, { withCredentials: true });
  }

  // ==========================================
  // 🧹 LIMPIEZA TOTAL
  // ==========================================

  vaciarCarrito() {
    this._carrito.next([]); // Vaciamos la memoria RAM
    
    // 🧹 Solo dejamos esto por precaución, para borrar cualquier basura vieja que haya quedado
    localStorage.removeItem('carrito_dunaroma'); 
    
    console.log('🧹 Memoria del carrito vaciada por completo.');
  }

  // ==========================================
  // 💳 FUNCIONES DE APOYO Y STRIPE
  // ==========================================

  setCarrito(items: any[]) {
    this._carrito.next(items); // Actualizamos a los componentes (como tu icono del carrito)
    
    // ❌ AQUÍ ESTABA EL ERROR. 
    // Ya eliminamos la línea de localStorage.setItem. 
    // ¡El carrito ya no dejará rastros en la computadora!
  }

  getCarritoActual() {
    return this._carrito.value;
  }

  procesarPagoStripe(idUsuario: number) { 
    const payloadCheckout = {
      IdUsuario: idUsuario,
      items: this._carrito.value.map((item: any) => ({
        idPerfume: item.idPerfume,
        nombre: item.nombre, 
        precio: item.precio, 
        cantidad: item.cantidad || 1 
      }))
    };
    return this.http.post(this.stripeUrl, payloadCheckout, { withCredentials: true });
  }
}