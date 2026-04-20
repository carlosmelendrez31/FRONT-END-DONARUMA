import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../core/services/carrito.service'; 
import { AppStorageService } from '../../core/services/app-storage.service'; // 👈 Agregamos el servicio de almacenamiento
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {

  listaCarrito: any[] = [];

  private appStorage = inject(AppStorageService); // 👈 Inyectamos el servicio

  constructor(
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef // Ayuda a Angular a refrescar la vista cuando llegan los datos
  ) {}

  ngOnInit() {
    this.cargarCarritoDesdeBD();
  }

  // 🔍 FUNCIÓN: Lee el ID directamente de donde lo guardamos en el login
  obtenerIdUsuarioReal(): number {
    const idString = this.appStorage.getUserId(); // Esto lee 'userId' del localStorage
    return idString ? Number(idString) : 0; 
  }

  // 🚀 FUNCIÓN: Carga los datos frescos de PostgreSQL
  cargarCarritoDesdeBD() {
    const idUsuario = this.obtenerIdUsuarioReal();

    // Si el ID es 0, significa que no hay nadie logueado (o el tapete desinfectante limpió todo)
    if (idUsuario === 0) {
      this.listaCarrito = [];
      return;
    }

    this.carritoService.obtenerCarritoBD(idUsuario).subscribe({
      next: (datosBD: any) => {
        // Mapeamos los datos para que coincidan con lo que espera tu HTML
        this.listaCarrito = datosBD.map((item: any) => ({
          idCarritoItem: item.IdCarritoItem || item.idCarritoItem,
          idPerfume: item.idPerfume || item.IdPerfume,
          nombre: item.nombre,
          precio: Number(item.precio),
          cantidad: item.Cantidad || item.cantidad || 1,
          img1: item.img1 
        }));
        
        // ⚠️ ¡CLAVE PARA STRIPE! Le pasamos la lista al servicio para que Stripe sepa qué cobrar
        this.carritoService.setCarrito(this.listaCarrito);

        // Refrescamos los cálculos del total
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al recuperar el carrito de la BD:', err);
        // Si da error 404 (no tiene carrito aún), no mostramos alerta, solo lo dejamos vacío
        if (err.status !== 404) {
          this.mostrarAlertaElegante('No pudimos recuperar tus productos guardados.', 'warning');
        }
      }
    });
  }

  mostrarAlertaElegante(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    Swal.fire({
      title: tipo === 'success' ? '¡Éxito!' : (tipo === 'error' ? 'Error' : 'Aviso'),
      text: mensaje,
      icon: tipo,
      background: '#111827',
      color: '#ffffff',
      confirmButtonColor: '#fbbf24'
    });
  }

  calcularTotal(): number {
    return this.listaCarrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  pagarConStripe() {
    if (this.listaCarrito.length === 0) {
      this.mostrarAlertaElegante('Tu carrito está vacío', 'warning');
      return;
    }

    // 👉 PASO 1: Sacamos la credencial del usuario (su ID)
    const idUsuario = this.obtenerIdUsuarioReal();

    // 🛡️ Pequeña validación de seguridad por si acaso
    if (idUsuario === 0) {
      this.mostrarAlertaElegante('Por favor, inicia sesión para poder pagar.', 'warning');
      return;
    }

    // 👉 PASO 2: Le pasamos ese ID a nuestro servicio
    this.carritoService.procesarPagoStripe(idUsuario).subscribe({
      next: (respuesta: any) => {
        if (respuesta.url) {
          window.location.href = respuesta.url; 
        }
      },
      error: (err) => {
        console.error('Error en el checkout:', err);
        this.mostrarAlertaElegante('Error al conectar con Stripe.', 'error');
      }
    });
  }
}