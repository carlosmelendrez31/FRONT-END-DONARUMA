import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-exitoso.html',
  styleUrl: './pago-exitoso.css',
})
export class PagoExitoso implements OnInit {
  isLoading = true;
  mensaje = 'Procesando tu pago...';
  exito = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.carritoService.confirmarPago(sessionId).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            this.exito = true;
            this.mensaje = res.mensaje || 'Compra registrada exitosamente.';
            this.carritoService.setCarrito([]); // Limpiar carrito local
          },
          error: (err) => {
            this.isLoading = false;
            this.exito = false;
            this.mensaje = 'Ocurrió un error al confirmar el pago. Por favor contacta a soporte.';
            console.error('Error al confirmar el pago', err);
          }
        });
      } else {
        this.isLoading = false;
        this.exito = false;
        this.mensaje = 'No se encontró la sesión de pago en la URL.';
      }
    });
  }

  volverAlInicio() {
    this.router.navigate(['/inicio']);
  }
}
