import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NovedadesService, Novedad } from '../../core/services/novedades';
import { PerfumeService } from '../../core/services/perfume'; 

@Component({
  selector: 'app-novedades',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './novedades.html',
  styleUrl: './novedades.css'
})
export class NovedadesComponent implements OnInit {
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

  // 👇 DICCIONARIO DE FAMILIAS AGREGADO 👇
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

  ngOnInit() {
    this.cargarNovedades();
    this.cargarPerfumesAleatorios();
    this.cargarCarrito();
  }

  // 👇 FUNCION TRADUCTORA DE FAMILIAS 👇
  getNombreFamilia(id: number): string {
    const familia = this.listaFamilias.find(f => f.id === id);
    return familia ? familia.nombre : '';
  }

  cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carritoDunaroma');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
    }
  }

  guardarCarrito() {
    localStorage.setItem('carritoDunaroma', JSON.stringify(this.carrito));
  }

  agregarAlCarrito(perfume: any) {
    const itemExistente = this.carrito.find(item => item.nombre === perfume.nombre); 
    
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.carrito.push({ ...perfume, cantidad: 1 });
    }

    this.guardarCarrito(); 
    this.cerrarModal(); 
    this.mostrarNotificacion(`¡${perfume.nombre} se agregó al carrito!`);
  }

  toggleCarrito() {
    this.cargarCarrito(); // 👇 Trae datos frescos de Inicio antes de abrir 👇
    this.carritoAbierto = !this.carritoAbierto;
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  calcularTotalCarrito() {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

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