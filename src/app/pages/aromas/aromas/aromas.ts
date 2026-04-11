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

  // --- VARIABLES DEL CARRITO ---
  carritoAbierto = false;
  carrito: any[] = [];

  ngOnInit(): void {
    // 🌟 Cargamos el carrito al entrar a la página
    this.cargarCarrito();

    this.perfumesService.obtenerPerfumes().subscribe({
      next: (datosBackend: any[]) => { 
        this.todosLosPerfumes = datosBackend.map(perfume => {
          let urlImagenFinal = perfume.imagen_Url || perfume.Imagen_Url;
          if (!urlImagenFinal || urlImagenFinal === 'string' || urlImagenFinal === 'null' || urlImagenFinal.trim() === '') {
            urlImagenFinal = 'https://placehold.co/600x600/0f172a/d4af37/png?text=DUNAROMA';
          }

          let nombreFinal = perfume.nombre || perfume.Nombre || perfume.marca || perfume.Marca;
          
          let familiasArrayTraducidas: string[] = [];
          let familiasTexto = 'sin familia';

          const familiasIds = perfume.familiasOlfativasIds || perfume.FamiliasOlfativasIds || [];

          if (familiasIds && familiasIds.length > 0) {
            familiasArrayTraducidas = familiasIds.map((id: number) => this.diccionarioFamilias[id] || `Familia ${id}`);
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
            
            aromatico: perfume.aromatico ?? perfume.Aromatico ?? 0,
            intensidad: perfume.intensidad ?? perfume.Intensidad ?? 0,
            dulzor: perfume.dulzor ?? perfume.Dulzor ?? 0,
            duracion: perfume.duracion ?? perfume.Duracion ?? 0,
            
            familiaOlfativa: familiasTexto,
            familiasArray: familiasArrayTraducidas,
            
            genero: perfume.genero || perfume.Genero || 'Unisex',
            ocasion: perfume.ocasion || perfume.Ocasion || 'Uso Diario',
            stock: perfume.stock ?? perfume.Stock ?? 0,
            precio: perfume.precio ?? perfume.Precio ?? 0,
            marca: perfume.marca || perfume.Marca || 'Desconocida',
            descripcion: perfume.descripcion || perfume.Descripcion || 'Una fragancia única inspirada en la esencia del desierto.'
          };
        });

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

  aplicarFiltros() {
    let filtrados = this.todosLosPerfumes;

    if (this.filtroSeleccionado !== 'Todos') {
      filtrados = filtrados.filter(p => 
        p.familiasArray && p.familiasArray.includes(this.filtroSeleccionado)
      );
    }

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
    this.imagenSeleccionada = perfume.imagenMostrar || 'https://placehold.co/600x600/0f172a/d4af37/png?text=DUNAROMA';
  }

  cerrarModal() {
    this.perfumeSeleccionado = null;
  }

  cambiarImagen(url: string | undefined | null) {
    if (url) this.imagenSeleccionada = url;
  }

  // --- LÓGICA DEL CARRITO GLOBAL ---
  cargarCarrito() {
    this.carrito = JSON.parse(localStorage.getItem('carrito_dunaroma') || '[]');
  }

  agregarAlCarrito(producto: any) {
    let carrito = JSON.parse(localStorage.getItem('carrito_dunaroma') || '[]');
    const itemExistente = carrito.find((item: any) => item.idPerfume === producto.idPerfume);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      const productoParaCarrito = {
        idPerfume: producto.idPerfume,
        nombre: producto.nombreMostrar,
        marca: producto.marca,
        precio: producto.precio, 
        img1: producto.imagenMostrar,
        cantidad: 1
      };
      carrito.push(productoParaCarrito);
    }

    localStorage.setItem('carrito_dunaroma', JSON.stringify(carrito));
    
    // 🌟 Actualizamos la vista del carrito y cerramos modal
    this.cargarCarrito(); 
    alert(`¡${producto.nombreMostrar} se agregó al carrito! 🛒`);
    this.cerrarModal();
  }

  toggleCarrito() { 
    this.carritoAbierto = !this.carritoAbierto; 
    if (this.carritoAbierto) {
      this.cargarCarrito(); 
    }
  }

  eliminarDelCarrito(index: number) { 
    this.carrito.splice(index, 1); 
    localStorage.setItem('carrito_dunaroma', JSON.stringify(this.carrito));
  }

  calcularTotalCarrito(): number { 
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0); 
  }
}