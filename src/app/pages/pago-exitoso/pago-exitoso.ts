import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../core/services/carrito.service';// 👈 Revisa que esta ruta a tu servicio sea correcta

@Component({
  selector: 'app-pago-exitoso',
  standalone: true, // Si usas Angular moderno, déjalo así
  templateUrl: './pago-exitoso.html',
  styleUrls: ['./pago-exitoso.css']
})
export class PagoExitosoComponent implements OnInit {

  constructor(private carritoService: CarritoService) { }

  ngOnInit(): void {
    // En cuanto el cliente llega aquí, vaciamos el carrito
    this.carritoService.vaciarCarrito();
  }
}