import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe } from '@stripe/stripe-js';
import { CarritoService } from '../../core/services/carrito.service'; 

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

  // 🔥 AQUÍ ESTÁ LA FUNCIÓN MÁGICA PARA SUMAR EL DINERO
  calcularTotal(): number {
    return this.listaCarrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

 pagarConStripe() {
  this.carritoService.procesarPagoStripe().subscribe({
    next: (respuesta: any) => {
      // Stripe nos manda la URL de cobro y Angular nos redirige automáticamente
      window.location.href = respuesta.url; 
    },
    error: (err) => {
      console.error("Hubo un error al crear la sesión de pago", err);
    }
  });
}
}