import { Component } from '@angular/core';
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
export class Carrito {

  // Un carrito de prueba simulado para ver que funcione
  listaCarrito = [
    { nombre: 'Valentino Born In Roma', precio: 600.00, cantidad: 1 },
    { nombre: 'Hugo Boss', precio: 320.00, cantidad: 2 }
  ];

  constructor(private carritoService: CarritoService) {}

  pagarConStripe() {
    // Ya no necesitamos cargar la llave pública aquí, el backend hace todo el trabajo pesado
    this.carritoService.procesarPagoStripe(this.listaCarrito).subscribe({
      next: (respuesta: any) => {
        
        // ¡La nueva forma mágica! Si el servidor nos responde con la URL de Stripe, mandamos al cliente directo para allá
        if (respuesta.url) {
          window.location.href = respuesta.url; 
        }

      },
      error: (err) => {
        console.error('Hubo un error al conectar con el servidor', err);
        alert('Error al conectar con el servidor. Revisa la consola.');
      }
    });
  }
}