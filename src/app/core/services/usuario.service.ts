import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Usuarios';

  // 🛡️ EL PERMISO DE SEGURIDAD: 
  // Esto le dice a Google Chrome: "Sí, por favor adjunta la cookie HttpOnly 
  // que tiene el Token JWT cuando hables con Railway".
  private opcionesHttp = {
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  confirmarCuenta(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirmar`, { token }, this.opcionesHttp);
  }

  // Traer los datos del usuario por ID (GET)
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.opcionesHttp); // Agregamos opcionesHttp
  }

  // Actualizar Nombre, Apellidos y Dirección (PUT)
  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/actualizar`, datos, this.opcionesHttp); // Agregamos opcionesHttp
  }

  // Cambiar contraseña
  cambiarPassword(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cambiar-password`, datos, this.opcionesHttp); // Agregamos opcionesHttp
  }
}