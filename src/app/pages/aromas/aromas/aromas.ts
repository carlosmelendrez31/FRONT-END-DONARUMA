import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 1. ¡NUEVO! Importamos FormsModule
import { FamiliasOlfativas } from '../../../core/services/familias-olfativas.service';
import { PerfumeOlfativo } from '../../../core/models/familia-olfativa/familia-olfativa';

@Component({
  selector: 'app-aromas',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. ¡NUEVO! Lo agregamos a los imports
  templateUrl: './aromas.html',
  styleUrl: './aromas.css',
})
export class Aromas implements OnInit {
  private perfumesService = inject(FamiliasOlfativas);

  todosLosPerfumes: PerfumeOlfativo[] = [];
  productosAMostrar: PerfumeOlfativo[] = [];
  filtroSeleccionado: string = '';
  perfumeSeleccionado: PerfumeOlfativo | null = null;
  
  // 3. ¡NUEVO! Variable para guardar lo que el usuario escribe
  textoBusqueda: string = ''; 

  ngOnInit(): void {
    this.perfumesService.obtenerPerfumes().subscribe({
      next: (datosBackend) => {
        this.todosLosPerfumes = datosBackend.map(perfume => {
          let urlImagenFinal = perfume.imagen_Url;
          if (!urlImagenFinal || urlImagenFinal === 'string' || urlImagenFinal === 'null' || urlImagenFinal.trim() === '') {
            urlImagenFinal = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop';
          }

          let nombreFinal = perfume.nombre && perfume.nombre.trim() !== '' ? perfume.nombre : perfume.marca;
          let familiasTexto = perfume.familiaOlfativa ? perfume.familiaOlfativa.toLowerCase() : 'sin familia';

          return {
            ...perfume,
            nombreMostrar: nombreFinal || 'Perfume Exclusivo',
            imagenMostrar: urlImagenFinal,
            familiaOlfativa: familiasTexto,
            familiasArray: familiasTexto.split(',').map((f: string) => f.trim())
          };
        });
      },
      error: (error) => {
        console.error('Error al conectar con la API de .NET:', error);
      }
    });
  }

  // 4. Modificamos el botón para que limpie la búsqueda al cambiar de categoría
  filtrar(familia: string) {
    this.filtroSeleccionado = familia;
    this.textoBusqueda = ''; // Limpiamos el buscador al cambiar de pestaña
    this.aplicarFiltros();   // Llamamos a la función maestra
  }

  // 5. ¡NUEVO! Función maestra que filtra por familia Y por nombre
  aplicarFiltros() {
    if (this.filtroSeleccionado === '') {
      this.productosAMostrar = []; // Si no hay familia, no mostramos nada
      return;
    }

    // Primero filtramos por la familia seleccionada (ej. 'cítricos')
    let filtrados = this.todosLosPerfumes.filter(p => 
      p.familiaOlfativa && p.familiaOlfativa.includes(this.filtroSeleccionado)
    );

    // Luego, si el usuario escribió algo, filtramos esa lista por nombre o marca
    if (this.textoBusqueda.trim() !== '') {
      const texto = this.textoBusqueda.toLowerCase().trim();
if (this.textoBusqueda.trim() !== '') {
      const texto = this.textoBusqueda.toLowerCase().trim();
      
      filtrados = filtrados.filter(p => 
        // Le ponemos el ? a nombreMostrar y a marca para proteger el código
        p.nombreMostrar?.toLowerCase().includes(texto) || 
        p.marca?.toLowerCase().includes(texto)
      );
    }
    }

    this.productosAMostrar = filtrados;
  }

  abrirModal(perfume: PerfumeOlfativo) {
    this.perfumeSeleccionado = perfume;
  }

  cerrarModal() {
    this.perfumeSeleccionado = null;
  }
}