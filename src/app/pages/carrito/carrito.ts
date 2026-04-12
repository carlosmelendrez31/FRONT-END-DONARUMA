import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../core/services/carrito.service'; 
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

  constructor(
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef // 👈 Ayuda a Angular a refrescar la vista cuando llegan los datos
  ) {}

  ngOnInit() {
    // 🌟 Ahora, en lugar de solo leer la memoria, vamos directo a la Base de Datos
    this.cargarCarritoDesdeBD();
  }

  // 🔍 FUNCIÓN: Lee el Token y extrae el ID real del usuario
  obtenerIdUsuarioReal(): number {
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64);
        const datosUsuario = JSON.parse(payloadDecodificado);

        // Buscamos el ID con los nombres que usa tu C#
        const idReal = datosUsuario.idusuario || datosUsuario.IdUsuario || datosUsuario.id || datosUsuario.nameid || datosUsuario.sub;
        
        return idReal ? Number(idReal) : 1;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    return 1; // ID por defecto si no hay sesión
  }

  // 🚀 FUNCIÓN: Carga los datos frescos de PostgreSQL
  cargarCarritoDesdeBD() {
    const idUsuario = this.obtenerIdUsuarioReal();

    this.carritoService.obtenerCarritoBD(idUsuario).subscribe({
      next: (datosBD: any) => {
        // Mapeamos los datos para que coincidan con lo que espera tu HTML
        this.listaCarrito = datosBD.map((item: any) => ({
          idCarritoItem: item.IdCarritoItem || item.idCarritoItem,
          nombre: item.nombre,
          precio: Number(item.precio),
          cantidad: item.Cantidad || item.cantidad || 1,
          img1: item.img1 // Asegúrate que en C# el JOIN devuelva p.imagen_url as img1
        }));
        
        // Refrescamos los cálculos del total
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al recuperar el carrito de la BD:', err);
        this.mostrarAlertaElegante('No pudimos recuperar tus productos guardados.', 'warning');
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

    this.carritoService.procesarPagoStripe().subscribe({
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