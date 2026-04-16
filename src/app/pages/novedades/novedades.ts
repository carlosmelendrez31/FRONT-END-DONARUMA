import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NovedadesService, Novedad } from '../../core/services/novedades';
import { PerfumeService } from '../../core/services/perfume'; 
import { CarritoService } from '../../core/services/carrito.service';
import { AppStorageService } from '../../core/services/app-storage.service'; // 👈 IMPORTAMOS EL STORAGE
import { Subscription } from 'rxjs'; // 👈 IMPORTAMOS PARA LA CONEXIÓN TELEPÁTICA

@Component({
  selector: 'app-novedades',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './novedades.html',
  styleUrl: './novedades.css'
})
export class NovedadesComponent implements OnInit, OnDestroy {
  // Variables para Novedades
  listaNovedades: Novedad[] = [];
  cargando: boolean = true;
  perfumesTendencia: any[] = [];
  
  // Variables para el Modal
  modalAbierto: boolean = false;
  perfumeSeleccionado: any = null;
  
  // Variables del carrito
  notificaciones: string[] = [];
  carrito: any[] = [];
  carritoAbierto: boolean = false;
  private carritoSub!: Subscription; // 👈 VARIABLE PARA LA CONEXIÓN

  // DICCIONARIO DE FAMILIAS
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

  // Inyecciones
  private novedadesService = inject(NovedadesService);
  private perfumeService = inject(PerfumeService); 
  private carritoService = inject(CarritoService);
  private appStorage = inject(AppStorageService); // 👈 INYECTAMOS EL SERVICIO
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit() {
    // 🧠 1. Conexión telepática con la memoria RAM del Carrito
    this.carritoSub = this.carritoService.carrito$.subscribe(items => {
      this.carrito = items;
      this.cdr.detectChanges();
    });

    this.cargarNovedades();
    this.cargarPerfumesAleatorios();
    this.cargarCarritoDesdeBD(); // 🌟 Actualizado a la BD al iniciar
  }

  ngOnDestroy() {
    // 🧹 Limpiamos la conexión al salir de la página
    if (this.carritoSub) this.carritoSub.unsubscribe();
  }

  getNombreFamilia(id: number): string {
    const familia = this.listaFamilias.find(f => f.id === id);
    return familia ? familia.nombre : '';
  }

  // =========================================================
  // 🚀 LÓGICA DEL CARRITO (TOTALMENTE PURIFICADA)
  // =========================================================

  obtenerIdUsuarioReal(): number {
    // 🧹 Leemos el ID inofensivo directamente
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
        
        // 🚀 Actualizamos la RAM Global
        this.carritoService.setCarrito(itemsMapeados);
      },
      error: (err: any) => {
        console.error('Error al cargar el carrito:', err);
        if(err.status === 404) this.carritoService.setCarrito([]);
      }
    });
  }

  agregarAlCarrito(perfume: any, cantidad: number = 1) {
    const idUsuario = this.obtenerIdUsuarioReal(); 

    if (idUsuario === 0) {
      this.mostrarNotificacion('Inicia sesión para agregar productos');
      return;
    }

    // Buscamos el ID real sin importar si viene con mayúsculas o minúsculas
    const idPerfumeReal = perfume.idPerfume || perfume.idperfume || perfume.IdPerfume;

    this.carritoService.agregarAlCarritoBD(idUsuario, idPerfumeReal, cantidad).subscribe({
      next: (res: any) => {
        this.mostrarNotificacion(`¡${perfume.nombre} se agregó al carrito!`); 
        if (this.modalAbierto) this.cerrarModal();
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

  calcularTotalCarrito(): number { 
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
    document.body.classList.remove('modal-open'); 
    this.router.navigate(['/carrito']);
  }

  // =========================================================
  // RESTO DE FUNCIONES (NOVEDADES Y MODALES)
  // =========================================================

  cargarNovedades() {
    this.novedadesService.obtenerTodas().subscribe({
      next: (data: any) => {
        this.listaNovedades = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar Novedades', err);
        this.cargando = false;
      }
    });
  }

  cargarPerfumesAleatorios() {
    this.perfumeService.obtenerTodos().subscribe({
      next: (data: any) => {
        const mezclados = data.sort(() => 0.5 - Math.random());
        this.perfumesTendencia = mezclados.slice(0, 3);
      },
      error: (err: any) => console.error('Error al cargar Perfumes', err)
    });
  }

  abrirModal(perfume: any) {
    this.perfumeSeleccionado = perfume;
    this.modalAbierto = true;
    document.body.classList.add('modal-open');
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.perfumeSeleccionado = null;
    document.body.classList.remove('modal-open');
  }

  mostrarNotificacion(mensaje: string) {
    this.notificaciones.push(mensaje);
    setTimeout(() => {
      this.notificaciones.shift(); 
    }, 3000);
  }

  suscribirVIP(email: string) {
    if (!email || email.trim() === '') {
      this.mostrarNotificacion('⚠️ Por favor, ingresa un correo válido.');
      return;
    }
    this.mostrarNotificacion('🎉 ¡Te has suscrito exitosamente al Club DUNAROMA!');
  }
}