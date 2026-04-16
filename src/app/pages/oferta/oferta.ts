import { Router } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { AppStorageService } from '../../core/services/app-storage.service'; // 👈 IMPORTAMOS EL STORAGE
import { CommonModule } from '@angular/common'; 
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { Ofertasadm } from '../../core/services/ofertasadm'; 
import { Subscription } from 'rxjs'; // 👈 IMPORTAMOS PARA LA SINCRONIZACIÓN

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './oferta.html',
  styleUrl: './oferta.css',
})
export class Ofertas implements OnInit, OnDestroy {
  
  private ofertasService = inject(Ofertasadm);
  private router = inject(Router);
  private carritoService = inject(CarritoService);
  private appStorage = inject(AppStorageService); // 👈 INYECTAMOS EL SERVICIO
  private cdr = inject(ChangeDetectorRef); // 👈 AYUDA A REFRESCAR LA PANTALLA

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
  notificaciones: string[] = [];
  verificandoOferta: boolean = true;

  // --- VARIABLES DEL CARRITO ---
  carritoAbierto: boolean = false;
  carrito: any[] = [];
  private carritoSub!: Subscription; // 👈 VARIABLE PARA LA CONEXIÓN TELEPÁTICA

  ngOnInit(): void {
    // 🧠 1. Conexión telepática con la memoria RAM del Carrito
    this.carritoSub = this.carritoService.carrito$.subscribe(items => {
      this.carrito = items;
      this.cdr.detectChanges();
    });

    this.cargarCarritoDesdeBD(); // 🌟 Actualizado a la BD al iniciar
    this.cargarDatosDesdeAPI();
  }

  cargarDatosDesdeAPI(): void {
    this.ofertasService.obtenerRelojCliente().subscribe({
      next: (config) => {
        if (config && config.fechaFinOferta && config.activo) {
          this.fechaDestino = new Date(config.fechaFinOferta);
          if (this.fechaDestino.getTime() > new Date().getTime()) {
            this.iniciarRelojReal();
            this.cargarPerfumes(); 
          } else {
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
        this.verificandoOferta = false; 
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.verificandoOferta = false;
      }
    });
  }

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
    if (this.carritoSub) this.carritoSub.unsubscribe(); // 👈 Limpiamos la conexión al salir
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

  mostrarNotificacion(mensaje: string) {
    setTimeout(() => {
      this.notificaciones.push(mensaje);
    }, 0);
    setTimeout(() => {
      this.notificaciones.shift(); 
    }, 3000);
  }

  // =========================================================
  // 🚀 LÓGICA DEL CARRITO (PURIFICADA)
  // =========================================================

  obtenerIdUsuarioReal(): number {
    // 🧹 Leemos el ID inofensivo de la memoria, ¡adiós al atob() y al desencriptado!
    const idString = this.appStorage.getUserId();
    return idString ? Number(idString) : 0; 
  }
 
  cargarCarritoDesdeBD() {
    const idUsuario = this.obtenerIdUsuarioReal();
    
    if(idUsuario === 0) {
      this.carritoService.setCarrito([]);
      return;
    }

    this.carritoService.obtenerCarritoBD(idUsuario).subscribe({
      next: (datosBD: any) => {
        const itemsMapeados = datosBD.map((item: any) => ({
          idCarritoItem: item.IdCarritoItem || item.idCarritoItem || item.idcarritoitem,
          nombre: item.nombre,
          precio: Number(item.precio), 
          cantidad: item.Cantidad || item.cantidad || 1, 
          img1: item.img1
        }));
        
        // 🚀 Actualizamos la RAM Global. Al hacer esto, this.carrito se llena solo.
        this.carritoService.setCarrito(itemsMapeados);
      },
      error: (err: any) => {
        console.error('Error al cargar el carrito:', err);
        if(err.status === 404) this.carritoService.setCarrito([]);
      }
    });
  }

  agregarAlCarrito(perfume: any) {
    const idUsuario = this.obtenerIdUsuarioReal(); 

    if (idUsuario === 0) {
      this.mostrarNotificacion('Inicia sesión para agregar productos');
      return;
    }

    this.carritoService.agregarAlCarritoBD(idUsuario, perfume.idPerfume, 1).subscribe({
      next: (res: any) => {
        this.mostrarNotificacion('¡Agregado exitosamente al carrito!'); 
        this.cerrarModal();
        this.cargarCarritoDesdeBD(); // Refrescamos la RAM
      },
      error: (err: any) => {
        console.error('ERROR AL CONECTAR CON C#:', err);
        this.mostrarNotificacion('Hubo un error al agregar el perfume');
      }
    });
  }

  eliminarDelCarrito(index: number) {
    const itemABorrar = this.carrito[index];
    this.carritoService.eliminarItemBD(itemABorrar.idCarritoItem).subscribe({
      next: (respuesta: any) => {
        this.mostrarNotificacion('Perfume eliminado del carrito');
        this.cargarCarritoDesdeBD(); // Refrescamos la RAM
      },
      error: (err: any) => {
        console.error('Error al eliminar en BD:', err);
        this.mostrarNotificacion('Hubo un error al intentar eliminar');
      }
    });
  }

  calcularTotalCarrito() {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  toggleCarrito() {
    if (!this.carritoAbierto) {
      this.cargarCarritoDesdeBD();
    }
    this.carritoAbierto = !this.carritoAbierto;
  }

  irAlCarrito() {
    this.carritoAbierto = false; 
    this.router.navigate(['/carrito']);
  }
}