import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Creamos la interfaz (el molde) para que Angular sepa qué es una Novedad
export interface Novedad {
  idNovedad?: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  fechaPublicacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NovedadesService {
  
  private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Novedades';

  constructor(private http: HttpClient) { }

  // 1. Traer todas las publicaciones (Para el muro público)
  obtenerTodas(): Observable<Novedad[]> {
    return this.http.get<Novedad[]>(`${this.apiUrl}/obtener-todas`);
  }

  // 2. Crear una nueva publicación (Para el panel de Admin)
  crearNovedad(novedad: Novedad): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, novedad);
  }

  // 3. Eliminar (Para el panel de Admin)
  eliminarNovedad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
  // 4. Traer UNA sola publicación por su ID
  obtenerPorId(id: number): Observable<Novedad> {
    return this.http.get<Novedad>(`${this.apiUrl}/obtener/${id}`);
  }
  // 5. Eliminar una publicación por su ID
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
  // Actualizar una publicación por su ID
  actualizar(id: number, novedad: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, novedad);
  }
}