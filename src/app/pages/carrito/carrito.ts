import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';
import { CarritoService } from '../../core/services/carrito.service';
import { AppStorageService, UserProfile } from '../../core/services/app-storage.service';
import Swal from 'sweetalert2';

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

  constructor(
    private carritoService: CarritoService, 
    private appStorage: AppStorageService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarCarritoDesdeBD();

    this.appStorage.userProfile$.subscribe(profile => {
      if (profile && profile.direccionUsuario) {
        this.direccionActual = profile.direccionUsuario;
      }
    });
  }

  obtenerIdUsuarioReal(): number {
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64);
        const datosUsuario = JSON.parse(payloadDecodificado);

        const idReal = datosUsuario.idusuario || datosUsuario.IdUsuario || datosUsuario.id || datosUsuario.nameid || datosUsuario.sub;
        
        return idReal ? Number(idReal) : 1;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    return 1;
  }

  cargarCarritoDesdeBD() {
    const idUsuario = this.obtenerIdUsuarioReal();

    this.carritoService.obtenerCarritoBD(idUsuario).subscribe({
      next: (datosBD: any) => {
        this.listaCarrito = datosBD.map((item: any) => ({
          idCarritoItem: item.IdCarritoItem || item.idCarritoItem || item.idcarritoitem,
          idPerfume: item.idPerfume || item.IdPerfume || item.idperfume, // Ensure idPerfume is propagated
          nombre: item.nombre,
          precio: Number(item.precio),
          cantidad: item.Cantidad || item.cantidad || 1,
          img1: item.img1
        }));
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al recuperar el carrito de la BD:', err);
        this.mostrarAlertaElegante('No pudimos recuperar tus productos guardados.', 'warning');
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
          this.mostrarAlertaElegante('¡Dirección actualizada!', 'success');
        },
        error: (err) => {
          console.error('Error actualizando la dirección', err);
          if (err.status === 401) {
            this.mostrarAlertaElegante('Tu sesión ha expirado, vuelve a iniciar sesión', 'warning');
          } else {
            this.mostrarAlertaElegante('Hubo un error al guardar tu dirección.', 'error');
          }
        }
      });
    } else {
      this.mostrarAlertaElegante('La dirección no puede estar vacía', 'warning');
    }
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
    console.log('Click en Pagar con Stripe! Lista del carrito:', this.listaCarrito);
    
    if (this.listaCarrito.length === 0) {
      this.mostrarAlertaElegante('Tu carrito está vacío', 'warning');
      return;
    }

    if (!this.direccionActual) {
      console.warn('Falta dirección de envío');
      this.mostrarAlertaElegante('Por favor agrega una dirección de envío antes de continuar.', 'warning');
      this.activarEdicionDireccion();
      return;
    }

    const perfumesIds = this.listaCarrito.map(item => item.idPerfume);
    const cantidades = this.listaCarrito.map(item => item.cantidad);

    console.log('A punto de llamar procesarPagoStripe con:', this.direccionActual, perfumesIds, cantidades);

    this.carritoService.procesarPagoStripe(this.direccionActual, perfumesIds, cantidades).subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta exitosa de Stripe:', respuesta);
        if (respuesta.url) {
          window.location.href = respuesta.url; 
        } else {
          console.error('El servidor respondió pero no trajo una URL válida', respuesta);
          this.mostrarAlertaElegante('Error inesperado: no se recibió el link de pago.', 'error');
        }
      },
      error: (err) => {
        console.error('Error en el checkout:', err);
        this.mostrarAlertaElegante('Error al conectar con el servidor. Revisa la consola para más detalles.', 'error');
      }
    });
  }
}