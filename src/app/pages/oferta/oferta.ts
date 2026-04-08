import { CommonModule, DecimalPipe } from '@angular/common'; 
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// Importa tu servicio (ajusta la ruta según tu proyecto)
import { Ofertasadm } from '../../core/services/ofertasadm'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink], 
  templateUrl: './oferta.html',
  styleUrl: './oferta.css',
})
export class Ofertas implements OnInit, OnDestroy {
  
  private ofertasService = inject(Ofertasadm);

  productosEnOferta: any[] = [];
  ofertaFinalizada: boolean = false;
  
  // Control del Modal
  perfumeSeleccionado: any = null;
  modalAbierto: boolean = false;

  // Lógica del Reloj
  dias: number = 0; 
  horas: number = 0;
  minutos: number = 0;
  segundos: number = 0;
  intervalo: any;
  fechaDestino: Date | null = null; // Guardará la fecha real de la base de datos

  verificandoOferta: boolean = true;

  ngOnInit(): void {
    this.cargarDatosDesdeAPI();
  }

cargarDatosDesdeAPI(): void {
    // 1. PRIMERO preguntamos por el reloj
    this.ofertasService.obtenerRelojCliente().subscribe({
      next: (config) => {
        if (config && config.fechaFinOferta && config.activo) {
          this.fechaDestino = new Date(config.fechaFinOferta);
          
          // Comprobamos si aún hay tiempo
          if (this.fechaDestino.getTime() > new Date().getTime()) {
            // SÍ HAY TIEMPO: Iniciamos el reloj y llamamos a los perfumes
            this.iniciarRelojReal();
            this.cargarPerfumes(); 
          } else {
            // NO HAY TIEMPO: Cortamos el acceso directamente
            this.ofertaFinalizada = true;
            this.verificandoOferta = false; // Terminamos de verificar
          }
        } else {
          this.ofertaFinalizada = true;
          this.verificandoOferta = false; // Terminamos de verificar
        }
      },
      error: (err) => {
        console.error('Error al cargar el reloj:', err);
        this.ofertaFinalizada = true;
        this.verificandoOferta = false;
      }
    });
  }

  // 2. Esta función SOLO se ejecutará si el reloj lo permite
  cargarPerfumes(): void {
    this.ofertasService.obtenerOfertasCliente().subscribe({
      next: (datosAPI) => {
        this.productosEnOferta = datosAPI.map(apiItem => ({
          idPerfume: apiItem.idPerfume,
          marca: apiItem.marca,
          nombreMostrar: apiItem.nombrePerfume,
          imagenMostrar: apiItem.imagen_Url,
          precioOriginal: apiItem.precioOriginal,
          precioOferta: apiItem.precioOferta,
          stock: apiItem.stock,
          
          descuento: apiItem.descuento, // <--- ¡ESTA ES LA LÍNEA QUE FALTABA! 
          
          genero: 'Unisex', 
          familiasArray: ['Privilege'] 
        }));
        
        // ¡Todo listo! Quitamos la pantalla de carga
        this.verificandoOferta = false; 
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.verificandoOferta = false;
      }
    });
  }

  // Nuevo motor del reloj basado en fechas reales
  iniciarRelojReal() {
    if (!this.fechaDestino) return;
    this.ofertaFinalizada = false; 

    this.intervalo = setInterval(() => {
      const ahora = new Date().getTime();
      const diferenciaMilisegundos = this.fechaDestino!.getTime() - ahora;

      if (diferenciaMilisegundos <= 0) {
        // El tiempo se acabó de verdad
        clearInterval(this.intervalo);
        this.detenerRelojEnCero();
      } else {
        // Cálculos matemáticos para extraer días, horas, mins y segs
        this.dias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
        this.horas = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutos = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60)) / (1000 * 60));
        this.segundos = Math.floor((diferenciaMilisegundos % (1000 * 60)) / 1000);
      }
    }, 1000); // Se ejecuta cada 1 segundo (1000 ms)
  }

  private detenerRelojEnCero() {
    this.segundos = 0;
    this.minutos = 0;
    this.horas = 0;
    this.dias = 0;
    this.ofertaFinalizada = true; 
    this.intervalo = null;
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // --- LÓGICA DEL MODAL DE OFERTA (Se queda igual) ---
  abrirModal(perfume: any) {
    this.perfumeSeleccionado = perfume;
    this.modalAbierto = true;
    document.body.style.overflow = 'hidden'; 
  }

  cerrarModal() {
    this.modalAbierto = false;
    setTimeout(() => {
      this.perfumeSeleccionado = null;
      document.body.style.overflow = 'auto'; 
    }, 300);
  }
}