import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfumeService } from '../../core/services/perfume';
import { Perfumes } from '../../core/models/perfumes/perfumes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {
  // Variables para la pantalla
  cantidad: number = 1;
  productos: Perfumes[] = []; 
  
  // Variables para controlar la ventana emergente (Modal)
  modalAbierto = false;
  imagenSeleccionada: string = '';
  productoSeleccionado: Perfumes | null = null;

  private productosSub!: Subscription;

  constructor(private perfumeService: PerfumeService) {}

  // Se ejecuta en cuanto la pantalla carga
  ngOnInit(): void {
    this.productosSub = this.perfumeService.perfumes$.subscribe({
      next: (prods) => {
        this.productos = prods;
        console.log('¡Perfumes descargados con éxito de la BD!', this.productos);
      },
      error: (err) => console.error('Upps, error al cargar los perfumes:', err)
    });
  }

  // Se ejecuta cuando nos salimos de la pantalla "Inicio"
  ngOnDestroy(): void {
    if (this.productosSub) {
      this.productosSub.unsubscribe();
    }
  }

 
  abrirModal(producto: Perfumes) {
    this.productoSeleccionado = producto;
    this.imagenSeleccionada = producto.img1 || producto.imagen_Url || 'assets/img/placeholder.png';
    this.cantidad = 1;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoSeleccionado = null;
  }

  cambiarImagen(url: string | undefined) {
    if (url) {
      this.imagenSeleccionada = url;
    }
  }
}