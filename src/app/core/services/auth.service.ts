import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { AppStorageService } from './app-storage.service'; 
import { CarritoService } from './carrito.service';       

export interface LoginResponse {
  exito: boolean;
  mensaje: string;
  rol?: string;
  idUsuario?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Auth';

  private http = inject(HttpClient);
  private appStorage = inject(AppStorageService);
  private carritoService = inject(CarritoService);

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena }, { withCredentials: true });
  }

  refresh(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true });
  }

  logout(): Observable<any> {
    // 🧹 1. EL VERDUGO: Destrucción inmediata de la memoria (RAM y LocalStorage)
    // Esto mata al fantasma antes de que el servidor siquiera parpadee.
    this.appStorage.clearStorage(); 
    this.carritoService.vaciarCarrito(); 
    
    console.log('🧹 Memoria de Angular destruida. El Fantasma ha muerto.');

    // 2. Cerramos sesión en el servidor
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}