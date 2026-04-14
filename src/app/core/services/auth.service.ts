import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  exito: boolean;
  mensaje: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://back-end-donaruma-production.up.railway.app/api/Auth';

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena });
  }

  refresh(refreshToken: string): Observable<LoginResponse> {
    // The backend refresh endpoint accepts a single string or JSON? 
    // Usually it accepts the refresh token, either in body or header.
    // Based on the given c# code, it's string refreshToken in Refresh(string refreshToken). 
    // Assuming it's in a JSON body or URL query. Let's pass it in the body as standard practice.
    // We'll pass it as { refreshToken: refreshToken } or maybe just a string. 
    // Often it expects { refreshToken }. If the backend expects something else, we might need to adjust.
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  logout(idUsuario: number): Observable<any> {
    // The C# backend expects idUsuario for logout. Usually this would be extracted from the token.
    return this.http.post<any>(`${this.apiUrl}/logout`, { idUsuario });
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
