import { CommonModule, DecimalPipe } from '@angular/common'; 
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, DecimalPipe], 
  // 👇 AQUÍ ESTÁ EL CAMBIO: Apuntando a tus nombres de archivo exactos
  templateUrl: './oferta.html',
  styleUrl: './oferta.css',
})
export class Ofertas implements OnInit, OnDestroy {
  
  productosEnOferta: any[] = [];
  ofertaFinalizada: boolean = false;
  // Control del Modal de Oferta
  perfumeSeleccionado: any = null;
  modalAbierto: boolean = false;

  // Lógica del Reloj
  dias: number = 0; 
  horas: number = 0;
  minutos: number = 0;
  segundos: number = 60; // 60 segundos para la prueba
  intervalo: any;

  ngOnInit(): void {
    this.iniciarReloj();
    this.cargarDatosPrueba();
  }

  iniciarReloj() {
    this.ofertaFinalizada = false; 

    this.intervalo = setInterval(() => {
      if (this.segundos > 0) {
        this.segundos--;
      } else {
        this.segundos = 59;
        if (this.minutos > 0) {
          this.minutos--;
        } else {
          this.minutos = 59;
          if (this.horas > 0) {
            this.horas--;
          } else {
            this.horas = 23;
            if (this.dias > 0) {
              this.dias--;
            } else {
              // El tiempo se acabó
              clearInterval(this.intervalo);
              this.detenerRelojEnCero();
            }
          }
        }
      }
    }, 1000);
  }

  private detenerRelojEnCero() {
    this.segundos = 0;
    this.minutos = 0;
    this.horas = 0;
    this.ofertaFinalizada = true; 
    this.intervalo = null;
  }

  // 🛠️ Panel de pruebas para cambiar el tiempo
  setReloj(d: string, h: string, m: string, s: string) {
    if (this.intervalo) clearInterval(this.intervalo);
    
    // Math.max asegura que si escriben un negativo (ej. -5), se asigne un 0
    this.dias = Math.max(0, parseInt(d) || 0);
    this.horas = Math.max(0, parseInt(h) || 0);
    this.minutos = Math.max(0, parseInt(m) || 0);
    this.segundos = Math.max(0, parseInt(s) || 0);
    
    this.iniciarReloj();
  }

  cargarDatosPrueba() {
    this.productosEnOferta = [
      { 
        idPerfume: 1, marca: 'Valentino', nombreMostrar: 'Valentino Born In Roma', 
        imagenMostrar: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600', 
        precioOriginal: 2500, precioOferta: 2000, 
        stock: 20, // 🟢 Dará VERDE (Más de 15)
        genero: 'Hombre', familiasArray: ['Amaderado', 'Especiado']
      },
      { 
        idPerfume: 2, marca: 'Dunaroma', nombreMostrar: 'Esencia Exclusiva N°5', 
        imagenMostrar: 'https://placehold.co/600x600/0f172a/d4af37/png?text=DUNAROMA',
        precioOriginal: 3200, precioOferta: 2560, 
        stock: 10, // 🟡 Dará AMARILLO (Entre 6 y 15)
        genero: 'Unisex', familiasArray: ['Orientales', 'Florales'] 
      },
      { 
        idPerfume: 3, marca: 'Carolina Herrera', nombreMostrar: 'Good Girl Supreme', 
        imagenMostrar: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600', 
        precioOriginal: 2800, precioOferta: 2240, 
        stock: 3, // 🔴 Dará ROJO (5 o menos)
        genero: 'Mujer', familiasArray: ['Gourmand', 'Frutales'] 
      },
      {
        idPerfume: 4, marca: 'Dunaroma', nombreMostrar: 'Esencia Exclusiva N°2', 
        imagenMostrar: 'https://placehold.co/600x600/0f172a/d4af37/png?text=DUNAROMA',
        precioOriginal: 2200, precioOferta: 1560, 
        stock: 0, // Estara en blanco y negro la imagen (En 0)
        genero: 'Mujer', familiasArray: ['Acuaticos', 'Herbales'] 
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // --- LÓGICA DEL MODAL DE OFERTA ---
  abrirModal(perfume: any) {
    this.perfumeSeleccionado = perfume;
    this.modalAbierto = true;
    document.body.style.overflow = 'hidden'; // Evita el scroll de fondo
  }

  cerrarModal() {
    this.modalAbierto = false;
    setTimeout(() => {
      this.perfumeSeleccionado = null;
      document.body.style.overflow = 'auto'; 
    }, 300);
  }
}
