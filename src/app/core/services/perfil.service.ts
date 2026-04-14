import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'https://back-end-donaruma-production.up.railway.app/api'; 

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/perfil`, this.getAuthHeaders());
  }

  actualizarPerfil(datos: { nombre: string, apellidos: string, correo: string, direccion: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/perfil`, datos, this.getAuthHeaders());
  }

  cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Observable<any> {
    const datos = { contrasenaActual, nuevaContrasena };
    return this.http.put(`${this.apiUrl}/usuarios/cambiar-contrasena`, datos, this.getAuthHeaders());
  }

  getHistorialCompras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compras/historial`, this.getAuthHeaders());
  }
}
