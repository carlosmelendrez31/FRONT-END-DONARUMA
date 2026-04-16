import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // Misma URL base, pero apuntando a Usuarios
  private apiUrl = 'https://localhost:7030/api/Usuarios'; 

  constructor(private http: HttpClient) {}

  // Traer los datos del usuario por ID (GET)
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Actualizar Nombre, Apellidos y Dirección (PUT)
  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/actualizar`, datos);
  }

  // Cambiar contraseña (Asumiendo que luego crees el endpoint en C#)
  cambiarPassword(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cambiar-password`, datos);
  }
}