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