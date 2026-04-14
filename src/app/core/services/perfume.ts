import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// Asegúrate de que esta ruta a tu interfaz sea la correcta
import { Perfumes } from '../models/perfumes/perfumes'; 

@Injectable({
  providedIn: 'root'
})
export class PerfumeService {
  // La URL base (ajusta el puerto si tu C# usa otro)
  private baseUrl = 'https://back-end-donaruma-production.up.railway.app/api/perfumes'; 

  private perfumesSubject = new BehaviorSubject<any[]>([]);
  public perfumes$ = this.perfumesSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.cargarPerfumes();
  }

  // --- 1. CARGAR/OBTENER TODOS (GET) ---
  // Este método actualiza el BehaviorSubject para la tienda
  cargarPerfumes(): void {
    this.http.get<any[]>(`${this.baseUrl}/todos`).pipe(
      tap((data) => {
        const perfumesListos = data.map(p => ({
          ...p,
          idPerfume: p.idPerfume || p.IdPerfume,
          nombre: p.nombre || p.Nombre, 
          precio: p.precio || p.Precio,
          marca: p.marca || p.Marca,
          descripcion: p.descripcion || p.Descripcion,
          stock: p.stock || p.Stock,
          genero: p.genero || p.Genero,
          ocasion: p.ocasion || p.Ocasion,
          imagen_Url: p.imagen_Url || p.Imagen_Url || p.imagen_url
        }));
        this.perfumesSubject.next(perfumesListos);
      })
    ).subscribe({
      error: (err) => console.error('Error al conectar con la API:', err)
    });
  }

  // Este es el que pide tu componente Admin
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/todos`);
  }

  // --- 2. CREAR (POST) ---
  crearPerfume(perfume: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/crear`, perfume).pipe(
      tap(() => this.cargarPerfumes()) // Recarga la lista automáticamente
    );
  }

  // --- 3. ACTUALIZAR (PUT) ---
  actualizarPerfume(id: number, perfume: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/actualizar/${id}`, perfume).pipe(
      tap(() => this.cargarPerfumes())
    );
  }

  // --- 4. ELIMINAR (DELETE) ---
  eliminarPerfume(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar/${id}`).pipe(
      tap(() => this.cargarPerfumes())
    );
  }
}