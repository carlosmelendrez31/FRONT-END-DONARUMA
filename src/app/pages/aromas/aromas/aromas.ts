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
  
  // 🌟 CAMBIO 1: Iniciamos con el filtro en "Todos" en lugar de vacío
  filtroSeleccionado: string = 'Todos'; 
  
  perfumeSeleccionado: PerfumeOlfativo | null = null;
  imagenSeleccionada: string = '';

  textoBusqueda: string = ''; 
  criterioBusqueda: string = 'nombre'; 

  diccionarioFamilias: { [key: number]: string } = {
    1: 'cítricos',
    2: 'florales',
    3: 'amaderados',
    4: 'orientales',
    5: 'frutales',
    6: 'gourmand',
    7: 'herbales',
    8: 'fougère',
    9: 'acuáticos'
  };

  ngOnInit(): void {
    this.perfumesService.obtenerPerfumes().subscribe({
      next: (datosBackend) => {
        this.todosLosPerfumes = datosBackend.map(perfume => {
          let urlImagenFinal = perfume.imagen_Url;
          if (!urlImagenFinal || urlImagenFinal === 'string' || urlImagenFinal === 'null' || urlImagenFinal.trim() === '') {
            // MONOGRAMA DE LA MARCA (Fondo azul oscuro, letra D dorada)
            urlImagenFinal = 'https://placehold.co/600x600/0f172a/d4af37/png?text=DUNAROMA';
          }

          let nombreFinal = perfume.nombre && perfume.nombre.trim() !== '' ? perfume.nombre : perfume.marca;
          
          let familiasArrayTraducidas: string[] = [];
          let familiasTexto = 'sin familia';

          if (perfume.familiasOlfativasIds && perfume.familiasOlfativasIds.length > 0) {
            familiasArrayTraducidas = perfume.familiasOlfativasIds.map((id: number) => this.diccionarioFamilias[id] || `Familia ${id}`);
            familiasTexto = familiasArrayTraducidas.join(', ');
          } else {
            familiasArrayTraducidas = ['Sin Familia'];
          }

          return {
            ...perfume,
            nombreMostrar: nombreFinal || 'Perfume Exclusivo',
            imagenMostrar: urlImagenFinal,
            img1: urlImagenFinal,
            img2: null, 
            aromatico: perfume.aromatico || 0,
            intensidad: perfume.intensidad || 0,
            dulzor: perfume.dulzor || 0,
            duracion: perfume.duracion || 0,
            familiaOlfativa: familiasTexto,
            familiasArray: familiasArrayTraducidas
          };
        });

        // 🌟 CAMBIO 2: Llenamos la pantalla en cuanto termina de cargar la API
        this.aplicarFiltros(); 
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

  // 🌟 CAMBIO 3: Lógica ajustada para que "Todos" muestre el catálogo completo
  aplicarFiltros() {
    let filtrados = this.todosLosPerfumes;

    // Solo filtramos si seleccionó algo distinto a "Todos"
    if (this.filtroSeleccionado !== 'Todos') {
      filtrados = filtrados.filter(p => 
        p.familiasArray && p.familiasArray.includes(this.filtroSeleccionado)
      );
    }

    // Filtro del buscador
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