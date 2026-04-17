import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // Misma URL base, pero apuntando a Usuarios
  private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Usuarios';

  constructor(private http: HttpClient) {}

  // 👇 AQUÍ AGREGAMOS LA NUEVA LLAVE PARA VERIFICAR EL CORREO 👇
  confirmarCuenta(token: string): Observable<any> {
    // Hace un POST a /api/Usuarios/confirmar enviando el token en el body
    return this.http.post<any>(`${this.apiUrl}/confirmar`, { token });
  }

  // Traer los datos del usuario por ID (GET)
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Actualizar Nombre, Apellidos y Dirección (PUT)
  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/actualizar`, datos);
  }

  // Cambiar contraseña
  cambiarPassword(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cambiar-password`, datos);
  }
}