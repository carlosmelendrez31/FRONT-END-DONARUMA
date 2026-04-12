import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';
import { CarritoService } from '../../core/services/carrito.service';
import { AppStorageService, UserProfile } from '../../core/services/app-storage.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {

  listaCarrito: any[] = [];
  direccionActual: string = '';
  editandoDireccion: boolean = false;
  nuevaDireccion: string = '';

  constructor(private carritoService: CarritoService, private appStorage: AppStorageService) {}

  ngOnInit() {
    const fromService = this.carritoService.getCarrito();
    if (fromService && fromService.length > 0) {
      this.listaCarrito = fromService;
    }

    this.appStorage.userProfile$.subscribe(profile => {
      if (profile && profile.direccionUsuario) {
        this.direccionActual = profile.direccionUsuario;
      }
    });
  }

  activarEdicionDireccion() {
    this.nuevaDireccion = this.direccionActual;
    this.editandoDireccion = true;
  }

  cancelarEdicionDireccion() {
    this.editandoDireccion = false;
  }

  guardarDireccion() {
    if (this.nuevaDireccion.trim()) {
      this.appStorage.guardarDireccion(this.nuevaDireccion).subscribe({
        next: () => {
          this.direccionActual = this.nuevaDireccion;
          this.editandoDireccion = false;
          alert('¡Dirección actualizada!');
        },
        error: (err) => {
          console.error('Error actualizando la dirección', err);
          if (err.status === 401) {
            alert('Tu sesión ha expirado, vuelve a iniciar sesión');
          } else {
            alert('Hubo un error al guardar tu dirección.');
          }
        }
      });
    } else {
      alert('La dirección no puede estar vacía');
    }
  }

  // 🔥 AQUÍ ESTÁ LA FUNCIÓN MÁGICA PARA SUMAR EL DINERO
  calcularTotal(): number {
    return this.listaCarrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  pagarConStripe() {
    console.log('Click en Pagar con Stripe! Lista del carrito:', this.listaCarrito);
    
    if (!this.direccionActual) {
      console.warn('Falta dirección de envío');
      alert('Por favor agrega una dirección de envío antes de continuar.');
      this.activarEdicionDireccion();
      return;
    }

    const perfumesIds = this.listaCarrito.map(item => item.idPerfume);
    const cantidades = this.listaCarrito.map(item => item.cantidad);

    console.log('A punto de llamar procesarPagoStripe con:', this.direccionActual, perfumesIds, cantidades);

    this.carritoService.procesarPagoStripe(this.direccionActual, perfumesIds, cantidades).subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta exitosa de Stripe:', respuesta);
        // ¡La nueva forma mágica! Si el servidor nos responde con la URL de Stripe, mandamos al cliente directo para allá
        if (respuesta.url) {
          window.location.href = respuesta.url; 
        } else {
          console.error('El servidor respondió pero no trajo una URL válida', respuesta);
          alert('Error inesperado: no se recibió el link de pago.');
        }
      },
      error: (err) => {
        console.error('Hubo un error al conectar con el servidor en procesarPagoStripe', err);
        alert('Error al conectar con el servidor. Revisa la consola para más detalles.');
      }
    });
  }
}