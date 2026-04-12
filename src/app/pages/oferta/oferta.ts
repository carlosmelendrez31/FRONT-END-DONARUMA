import { Router } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { CommonModule } from '@angular/common'; 
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Ofertasadm } from '../../core/services/ofertasadm'; 

@Component({
  selector: 'app-ofertas',
  standalone: true,
  // 👇 AQUÍ QUITAMOS LAS HERRAMIENTAS QUE NO SE USABAN 👇
  imports: [CommonModule], 
  templateUrl: './oferta.html',
  styleUrl: './oferta.css',
})
export class Ofertas implements OnInit, OnDestroy {
  
  private ofertasService = inject(Ofertasadm);
  private router = inject(Router);
private carritoService = inject(CarritoService);

  productosEnOferta: any[] = [];
  ofertaFinalizada: boolean = false;
  
  // Control del Modal
  perfumeSeleccionado: any = null;
  modalAbierto: boolean = false;

  // Lógica del Reloj
  dias: number = 0; 
  horas: number = 0;
  minutos: number = 0;
  segundos: number = 0;
  intervalo: any;
  fechaDestino: Date | null = null; 

  verificandoOferta: boolean = true;

  // --- VARIABLES DEL CARRITO ---
  carritoAbierto: boolean = false;
  carrito: any[] = [];
  notificaciones: string[] = [];

  ngOnInit(): void {
    this.cargarCarrito(); // 🌟 Cargar el carrito global al iniciar
    this.carritoAbierto = !this.carritoAbierto; 
    this.cargarDatosDesdeAPI();
  }

  cargarDatosDesdeAPI(): void {
    // 1. PRIMERO preguntamos por el reloj
    this.ofertasService.obtenerRelojCliente().subscribe({
      next: (config) => {
        if (config && config.fechaFinOferta && config.activo) {
          this.fechaDestino = new Date(config.fechaFinOferta);
          
          // Comprobamos si aún hay tiempo
          if (this.fechaDestino.getTime() > new Date().getTime()) {
            // SÍ HAY TIEMPO: Iniciamos el reloj y llamamos a los perfumes
            this.iniciarRelojReal();
            this.cargarPerfumes(); 
          } else {
            // NO HAY TIEMPO: Cortamos el acceso directamente
            this.ofertaFinalizada = true;
            this.verificandoOferta = false; 
          }
        } else {
          this.ofertaFinalizada = true;
          this.verificandoOferta = false; 
        }
      },
      error: (err) => {
        console.error('Error al cargar el reloj:', err);
        this.ofertaFinalizada = true;
        this.verificandoOferta = false;
      }
    });
  }

  // 2. Esta función SOLO se ejecutará si el reloj lo permite
  cargarPerfumes(): void {
    this.ofertasService.obtenerOfertasCliente().subscribe({
      next: (datosAPI) => {
        this.productosEnOferta = datosAPI.map(apiItem => ({
          idPerfume: apiItem.idPerfume,
          marca: apiItem.marca,
          nombreMostrar: apiItem.nombrePerfume,
          imagenMostrar: apiItem.imagen_Url,
          precioOriginal: apiItem.precioOriginal,
          precioOferta: apiItem.precioOferta,
          stock: apiItem.stock,
          
          descuento: apiItem.descuento, 
          
          genero: 'Unisex', 
          familiasArray: ['Privilege'] 
        }));
        
        // ¡Todo listo! Quitamos la pantalla de carga
        this.verificandoOferta = false; 
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.verificandoOferta = false;
      }
    });
  }

  // Nuevo motor del reloj basado en fechas reales
  iniciarRelojReal() {
    if (!this.fechaDestino) return;
    this.ofertaFinalizada = false; 

    this.intervalo = setInterval(() => {
      const ahora = new Date().getTime();
      const diferenciaMilisegundos = this.fechaDestino!.getTime() - ahora;

      if (diferenciaMilisegundos <= 0) {
        clearInterval(this.intervalo);
        this.detenerRelojEnCero();
      } else {
        this.dias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
        this.horas = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutos = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60)) / (1000 * 60));
        this.segundos = Math.floor((diferenciaMilisegundos % (1000 * 60)) / 1000);
      }
    }, 1000); 
  }

  private detenerRelojEnCero() {
    this.segundos = 0;
    this.minutos = 0;
    this.horas = 0;
    this.dias = 0;
    this.ofertaFinalizada = true; 
    this.intervalo = null;
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  abrirModal(perfume: any) {
    this.perfumeSeleccionado = perfume;
    this.modalAbierto = true;
    document.body.style.overflow = 'hidden'; 
  }

  cerrarModal() {
    this.modalAbierto = false;
    setTimeout(() => {
      this.perfumeSeleccionado = null;
      document.body.style.overflow = 'auto'; 
    }, 300);
  }

  // --- LÓGICA DEL CARRITO GLOBAL ---
  cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carritoDunaroma');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
    }
  }

   mostrarNotificacion(mensaje: string) {
    this.notificaciones.push(mensaje);
    setTimeout(() => {
      this.notificaciones.shift(); 
    }, 3000);
  }

  guardarCarrito() {
    localStorage.setItem('carritoDunaroma', JSON.stringify(this.carrito));
  }

  agregarAlCarrito(perfume: any) {
    const itemExistente = this.carrito.find(item => item.nombre === perfume.nombreMostrar); 
    
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.carrito.push({ 
        // 👇 Mapeamos los nombres para que el carrito general los entienda 👇
        idPerfume: perfume.idPerfume,
        nombre: perfume.nombreMostrar,
        precio: perfume.precioOferta,
        img1: perfume.imagenMostrar,
        cantidad: 1 
      });
    }

    this.guardarCarrito(); 
    this.cerrarModal(); 
    this.mostrarNotificacion(`¡${perfume.nombreMostrar} se agregó al carrito!`);
  }

  toggleCarrito() {
    this.cargarCarrito(); 
    this.carritoAbierto = !this.carritoAbierto;
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  calcularTotalCarrito() {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

irAlCarrito() {
  // 1. Guardamos los datos más frescos en el servicio central
  this.carritoService.setCarrito(this.carrito);

  // 2. Cerramos el panel lateral para que no estorbe
  this.carritoAbierto = false; 

  // 3. ¡Nos vamos a la página de cobro!
  this.router.navigate(['/carrito']);
}



}