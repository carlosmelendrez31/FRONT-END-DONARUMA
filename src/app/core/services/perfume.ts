import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Perfumes } from '../models/perfumes/perfumes';

@Injectable({
  providedIn: 'root'
})
export class PerfumeService {
  private apiUrl = 'https://localhost:7030/api/perfumes/todos';

  private perfumesSubject = new BehaviorSubject<any[]>([]); // Usamos any[] para evitar el error de tipado por ahora
  public perfumes$ = this.perfumesSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.cargarPerfumes();
  }

  cargarPerfumes(): void {
  this.http.get<any[]>(this.apiUrl).pipe(
    tap((data) => {
      console.log('Datos recibidos de C#:', data); 
      
      // Mapeo "a prueba de balas" (atrapa mayúsculas y minúsculas)
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
        
        // Usamos la imagen de la BD, o una de internet si está vacía (así evitamos el error 404)
        img1: p.imagen_Url || p.Imagen_Url || p.imagen_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400'
      }));

      this.perfumesSubject.next(perfumesListos);
    })
  ).subscribe({
    error: (err) => console.error('Error al conectar con la API:', err)
  });
}
}