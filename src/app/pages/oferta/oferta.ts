import { Router } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { CommonModule } from '@angular/common'; 
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Ofertasadm } from '../../core/services/ofertasadm'; 

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


  ngOnInit(): void {
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
  // 🚀 LÓGICA DEL CARRITO (CONECTADA A POSTGRESQL)
  // =========================================================

  obtenerIdUsuarioReal(): number {
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64);
        const datosUsuario = JSON.parse(payloadDecodificado);
        // console.log('CONTENIDO DEL TOKEN:', JSON.stringify(datosUsuario)); // Descomenta si necesitas debugear

        const idReal = datosUsuario.idusuario || datosUsuario.IdUsuario || datosUsuario.id || datosUsuario.nameid || datosUsuario['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || datosUsuario.sub;
        if (idReal) return Number(idReal); 

      } catch (error) {
        console.error('Error al leer el token:', error);
      }
    }
    return 1; 
  }
 
  cargarCarritoDesdeBD() {
    const idUsuario = this.obtenerIdUsuarioReal();
    this.carritoService.obtenerCarritoBD(idUsuario).subscribe({
      next: (datosBD: any) => {
        this.carrito = datosBD.map((item: any) => ({
          idCarritoItem: item.IdCarritoItem || item.idCarritoItem || item.idcarritoitem,
          nombre: item.nombre,
          precio: Number(item.precio), 
          cantidad: item.Cantidad || item.cantidad || 1, 
          img1: item.img1
        }));
      },
      error: (err: any) => {
        console.error('Error al cargar el carrito:', err);
      }
    });
  }

  agregarAlCarrito(perfume: any) {
    const idUsuario = this.obtenerIdUsuarioReal(); 
    this.carritoService.agregarAlCarritoBD(idUsuario, perfume.idPerfume, 1).subscribe({
      next: (res: any) => {
        this.mostrarNotificacion('¡Agregado exitosamente al carrito!'); 
        this.cerrarModal();
        this.cargarCarritoDesdeBD();
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
        this.carrito.splice(index, 1);
        this.mostrarNotificacion('Perfume eliminado del carrito');
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
    this.cargarCarritoDesdeBD();
    this.carritoAbierto = !this.carritoAbierto;
  }

  irAlCarrito() {
    this.carritoService.setCarrito(this.carrito);
    this.carritoAbierto = false; 
    this.router.navigate(['/carrito']);
  }
}