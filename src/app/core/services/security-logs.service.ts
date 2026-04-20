import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SecurityLogsService {
  // Ajusta esta URL según cómo manejes tus rutas en los demás servicios
  private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/SecurityLogs'; 

  constructor(private http: HttpClient) { }

  obtenerLogs(): Observable<any[]> {
    // Mandamos el token de autorización automáticamente si tienes un interceptor, 
    // o usamos withCredentials si manejas cookies.
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }
}