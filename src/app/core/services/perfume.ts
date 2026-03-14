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
        
        // El "traductor" de Mayúsculas (C#) a lo que tu HTML necesita
        const perfumesListos = data.map(p => ({
          ...p,
          idPerfume: p.IdPerfume,
          nombre: p.Nombre, 
          precio: p.Precio,
          marca: p.Marca,
          descripcion: p.Descripcion,
          stock: p.Stock,
          genero: p.Genero,
          ocasion: p.Ocasion,
          // Creamos img1 para que el HTML no falle
          img1: p.Imagen_Url || 'assets/img/placeholder.png',
          img2: p.Imagen_Url 
        }));

        this.perfumesSubject.next(perfumesListos);
      })
    ).subscribe({
      error: (err) => console.error('Error al conectar con la API:', err)
    });
  }
}