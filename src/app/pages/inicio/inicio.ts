import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfumeService } from '../../core/services/perfume';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {
  // Productos y Filtros
  productos: any[] = [];
  productosFiltrados: any[] = [];
  textoBusqueda: string = '';
  generoActivo: string = '';
  familiaActiva: string = '';
  ocasionActiva: string = '';
  criterioOrden: string = 'defecto';

  
  // Modal Vista Rápida
  modalAbierto = false;
  imagenSeleccionada: string = '';
  productoSeleccionado: any = null;
  cantidadModal: number = 1;

  // Carrito y Notificaciones
  carritoAbierto = false;
  carrito: any[] = [];
  notificaciones: any[] = [];

  // --- NUEVO: CARRUSEL HERO ---
  diapositivas = [
    { bg: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=2000', titulo: 'DUNAROMA', sub: 'Fragancias que nacen del viento y la arena.' },
    { bg: 'https://images.unsplash.com/photo-1595425970377-c9703cc48a2c?q=80&w=2000', titulo: 'ESENCIA NOCTURNA', sub: 'Descubre el misterio de la noche con nuestra colección.' },
    { bg: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=2000', titulo: 'OFERTA VIP', sub: 'Envío gratis en compras mayores a $1,500 MXN.' }
  ];
  diapositivaActual = 0;
  intervaloCarrusel: any;

  private productosSub!: Subscription;

  constructor(
    private perfumeService: PerfumeService, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.productosSub = this.perfumeService.perfumes$.subscribe({
      next: (prods) => {
        this.productos = prods.map(p => ({
          ...p,
          // 🔥 AQUÍ CONECTAMOS LA IMAGEN DEL BACK-END AL FRONT-END 🔥
          img1: p.imagen_Url || p.Imagen_Url || p.imagen_url || 'https://via.placeholder.com/300x300?text=Sin+Imagen',
          
          idPerfume: p.idPerfume || p.idperfume || p.IdPerfume,
          nombre: p.nombre || p.Nombre || p.nombreperfume,
          marca: p.marca || p.Marca,
          precio: p.precio || p.Precio,
          genero: p.genero || p.Genero,
          
          // Valores por defecto si la base de datos no los manda
          intensidad: p.intensidad ?? 50,
          dulzor: p.dulzor ?? 50,
          duracion: p.duracion ?? 50,
          aromatico: p.aromatico ?? 50,

          // Datos de prueba para el diseño (estrellas)
          rating: (Math.random() * (5 - 4) + 4).toFixed(1), 
          reviews: Math.floor(Math.random() * 200) + 15
        }));
        
        this.productosFiltrados = [...this.productos];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });

    
    if (isPlatformBrowser(this.platformId)) {
      this.intervaloCarrusel = setInterval(() => {
        this.siguienteDiapositiva();
      }, 5000); 
    }
  }

  ngOnDestroy(): void {
    if (this.productosSub) this.productosSub.unsubscribe();
    if (this.intervaloCarrusel) clearInterval(this.intervaloCarrusel);
  }

  // --- LÓGICA DEL CARRUSEL ---
  siguienteDiapositiva() {
    this.diapositivaActual = (this.diapositivaActual + 1) % this.diapositivas.length;
    this.cdr.detectChanges();
  }
  anteriorDiapositiva() {
    this.diapositivaActual = (this.diapositivaActual - 1 + this.diapositivas.length) % this.diapositivas.length;
  }
  irADiapositiva(index: number) {
    this.diapositivaActual = index;
  }

  // --- NUEVO: LOS MÁS VENDIDOS ---
  get mejoresVendidos() {
    // Tomamos los primeros 4 perfumes para mostrarlos como destacados
    return this.productos.slice(0, 4);
  }

  // --- NUEVO: SUSCRIBIR VIP ---
  suscribirVIP(email: string) {
    if(email) {
      this.lanzarNotificacion('¡Bienvenido al Club DUNAroma! Revisa tu correo.');
    }
  }

  // --- BUSCADOR, ORDEN Y FILTROS (Tus funciones intactas) ---
  buscarPorNombre() { this.aplicarFiltros(); }
  cambiarOrden() { this.aplicarFiltros(); }
  toggleGenero(genero: string) { this.generoActivo = this.generoActivo === genero ? '' : genero; this.aplicarFiltros(); }
  toggleFamilia(familia: string) { this.familiaActiva = this.familiaActiva === familia ? '' : familia; this.aplicarFiltros(); }
  toggleOcasion(ocasion: string) { this.ocasionActiva = this.ocasionActiva === ocasion ? '' : ocasion; this.aplicarFiltros(); }
  
  borrarFiltros() {
    this.generoActivo = ''; this.familiaActiva = ''; this.ocasionActiva = '';
    this.textoBusqueda = ''; this.criterioOrden = 'defecto';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = this.productos.filter(p => {
      const g = (p.genero || '').toLowerCase(); const f = (p.familia || '').toLowerCase();
      const o = (p.ocasion || '').toLowerCase(); const n = (p.nombre || '').toLowerCase();
      const b = this.textoBusqueda.toLowerCase();

      const pasaGenero = this.generoActivo === '' || g === this.generoActivo.toLowerCase();
      const pasaFamilia = this.familiaActiva === '' || f.includes(this.familiaActiva.toLowerCase());
      const pasaOcasion = this.ocasionActiva === '' || o.includes(this.ocasionActiva.toLowerCase());
      const pasaTexto = b === '' || n.includes(b);

      return pasaGenero && pasaFamilia && pasaOcasion && pasaTexto;
    });

    if (this.criterioOrden === 'precio-menor') { filtrados.sort((a, b) => a.precio - b.precio); } 
    else if (this.criterioOrden === 'precio-mayor') { filtrados.sort((a, b) => b.precio - a.precio); } 
    else if (this.criterioOrden === 'a-z') { filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); }

    this.productosFiltrados = filtrados;
  }

  // --- LÓGICA DEL CARRITO Y NOTIFICACIONES (Tus funciones intactas) ---
  agregarAlCarrito(producto: any, cantidad: number = 1) {
    const itemExistente = this.carrito.find(item => item.idPerfume === producto.idPerfume);
    if (itemExistente) { itemExistente.cantidad += cantidad; } 
    else { this.carrito.push({ ...producto, cantidad: cantidad }); }
    
    this.lanzarNotificacion(`¡${producto.nombre} se agregó al carrito!`);
    if (this.modalAbierto) this.cerrarModal();
  }

  eliminarDelCarrito(index: number) { this.carrito.splice(index, 1); }
  calcularTotalCarrito(): number { return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0); }
  toggleCarrito() { this.carritoAbierto = !this.carritoAbierto; }

  lanzarNotificacion(mensaje: string) {
    this.notificaciones.push(mensaje);
    setTimeout(() => { this.notificaciones.shift(); this.cdr.detectChanges(); }, 3500);
  }

  agregarFavorito(producto: any) { this.lanzarNotificacion(`¡${producto.nombre} guardado en favoritos! ❤`); }

  // --- LÓGICA DEL MODAL (Tus funciones intactas) ---
  abrirModal(producto: any) {
    this.productoSeleccionado = producto;
    this.imagenSeleccionada = producto.img1 || 'assets/img/placeholder.png';
    this.cantidadModal = 1;
    this.modalAbierto = true;
    document.body.classList.add('modal-open');
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoSeleccionado = null;
    document.body.classList.remove('modal-open');
  }

  cambiarImagen(url: string | undefined) { if (url) this.imagenSeleccionada = url; }


  // 🔥 ESTO ES LO QUE LE FALTA A TU ARCHIVO 🔥
  listaFamilias: any[] = [
    { id: 1, nombre: 'Cítricos' },
    { id: 2, nombre: 'Florales' },
    { id: 4, nombre: 'Orientales' },
    { id: 5, nombre: 'Frutales' },
    { id: 6, nombre: 'Gourmand' },
    { id: 7, nombre: 'Herbales' },
    { id: 8, nombre: 'Fougère' },
    { id: 9, nombre: 'Acuáticos' }
  ];

  getNombreFamilia(id: number): string {
    const familia = this.listaFamilias.find(f => f.id === id);
    return familia ? familia.nombre : '';
  }
}