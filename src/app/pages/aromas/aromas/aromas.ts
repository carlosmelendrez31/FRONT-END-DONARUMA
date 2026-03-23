import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FamiliasOlfativas } from '../../../core/services/familias-olfativas.service';
import { PerfumeOlfativo } from '../../../core/models/familia-olfativa/familia-olfativa';

@Component({
  selector: 'app-aromas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aromas.html',
  styleUrl: './aromas.css',
})
export class Aromas implements OnInit {
  private perfumesService = inject(FamiliasOlfativas);

  todosLosPerfumes: PerfumeOlfativo[] = [];
  productosAMostrar: PerfumeOlfativo[] = [];
  filtroSeleccionado: string = '';
  
  perfumeSeleccionado: PerfumeOlfativo | null = null;
  imagenSeleccionada: string = '';

  textoBusqueda: string = ''; 
  criterioBusqueda: string = 'nombre'; 

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
            img1: urlImagenFinal,
            img2: null, // Si tu base de datos tiene segunda imagen, ponla aquí
            aromatico: Math.floor(Math.random() * 100) + 1,
            intensidad: Math.floor(Math.random() * 100) + 1,
            dulzor: Math.floor(Math.random() * 100) + 1,
            duracion: Math.floor(Math.random() * 100) + 1,
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

  filtrar(familia: string) {
    this.filtroSeleccionado = familia;
    this.aplicarFiltros(); 
  }

  aplicarFiltros() {
    if (this.filtroSeleccionado === '') {
      this.productosAMostrar = []; 
      return;
    }

    let filtrados = this.todosLosPerfumes.filter(p => 
      p.familiaOlfativa && p.familiaOlfativa.includes(this.filtroSeleccionado)
    );

    if (this.textoBusqueda.trim() !== '') {
      const texto = this.textoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p => {
        const coincideNombre = p.nombreMostrar?.toLowerCase().includes(texto);
        const coincideMarca = p.marca?.toLowerCase().includes(texto);
        if (this.criterioBusqueda === 'nombre') return coincideNombre;
        if (this.criterioBusqueda === 'marca') return coincideMarca;
        return false; 
      });
    }

    this.productosAMostrar = filtrados;
  }

  abrirModal(perfume: PerfumeOlfativo) {
    this.perfumeSeleccionado = perfume;
    this.imagenSeleccionada = perfume.imagenMostrar || 'assets/img/placeholder.png';
  }

  cerrarModal() {
    this.perfumeSeleccionado = null;
  }

  cambiarImagen(url: string | undefined | null) {
    if (url) this.imagenSeleccionada = url;
  }
}