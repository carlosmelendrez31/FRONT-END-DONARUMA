import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../core/services/carrito.service'; 
import Swal from 'sweetalert2'; // 👈 1. IMPORT NUEVO DE LA LIBRERÍA

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {

  listaCarrito: any[] = [];

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    const fromService = this.carritoService.getCarrito();
    // Si hay datos en el servicio, los usamos. Si no, podemos dejarlo vacío o usar los de prueba por si recargan la página directamente.
    if (fromService && fromService.length > 0) {
      this.listaCarrito = fromService;
    }
  }

  // 👈 2. NUEVA HERRAMIENTA DE ALERTAS ELEGANTES
  mostrarAlertaElegante(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    Swal.fire({
      title: tipo === 'success' ? '¡Éxito!' : (tipo === 'error' ? 'Error' : 'Aviso'),
      text: mensaje,
      icon: tipo,
      background: '#111827', // Fondo oscuro tipo Dunaroma
      color: '#ffffff', // Letras blancas
      confirmButtonColor: '#fbbf24' // Botón dorado
    });
  }

  // 🔥 AQUÍ ESTÁ LA FUNCIÓN MÁGICA PARA SUMAR EL DINERO
  calcularTotal(): number {
    return this.listaCarrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  pagarConStripe() {
    // Ya no lleva argumentos adentro de los paréntesis
    this.carritoService.procesarPagoStripe().subscribe({
      next: (respuesta: any) => {
        // ¡La nueva forma mágica! Si el servidor nos responde con la URL de Stripe, mandamos al cliente directo para allá
        if (respuesta.url) {
          window.location.href = respuesta.url; 
        }
      },
      error: (err) => {
        console.error('Hubo un error al conectar con el servidor', err);
        // 👇 3. AQUÍ REEMPLAZAMOS EL VIEJO ALERT POR EL NUEVO PREMIUM 👇
        this.mostrarAlertaElegante('Error al conectar con el servidor. Revisa la consola.', 'error');
      }
    });
  }
}