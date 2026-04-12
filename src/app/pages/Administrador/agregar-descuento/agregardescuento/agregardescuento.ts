import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfumeAPI, OfertaItem } from '../../../../core/models/oferta/oferta';
import { Ofertasadm } from '../../../../core/services/ofertasadm';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-descuento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregardescuento.html',
  styleUrls: ['./agregardescuento.css']
})
export class AgregarDescuentoComponent implements OnInit {
  
  private Ofertasadm = inject(Ofertasadm);

  // --- CONTROL DE MODALES ---
  isModalOfertaAbierto: boolean = false;
  isModalRelojAbierto: boolean = false;

  // --- VARIABLES DE DATOS ---
  fechaFinOferta: string = '';
  perfumeSeleccionado: PerfumeAPI | null = null;
  porcentajeDescuento: number = 1;
  precioCalculado: number = 0;

  perfumesInventario: PerfumeAPI[] = [];
  ofertasActivas: OfertaItem[] = [];

  modoEdicion: boolean = false;

  ngOnInit(): void {
    this.cargarPerfumes();
    this.cargarTablaDesdeDB(); // 1. Agregamos esto para que cargue la lista al iniciar
    this.inicializarFechaPorDefecto();
  }

  mostrarAlertaElegante(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    Swal.fire({
      title: tipo === 'success' ? '¡Éxito!' : (tipo === 'error' ? 'Error' : 'Aviso'),
      text: mensaje,
      icon: tipo,
      background: '#111827', // Fondo oscuro
      color: '#ffffff', // Texto blanco
      confirmButtonColor: '#fbbf24' // Botón dorado Dunaroma
    });
  }

  // 2. NUEVA FUNCIÓN: Listar
  cargarTablaDesdeDB(): void {
    this.Ofertasadm.obtenerOfertasGuardadas().subscribe({
      next: (data) => {
        // Mapeamos lo que viene de la Vista de PostgreSQL al formato OfertaItem
        this.ofertasActivas = data.map(item => ({
          idTemporal: item.idoferta, // Guardamos el ID real de la DB aquí para usarlo en el Toggle
          idPerfume: item.idperfume,
          descuento: item.descuento,
          precioOferta: item.preciooferta,
          activo: item.activo,
          perfume: {
            nombre: item.nombre_perfume,
            marca: item.marca,
            precio: item.precio_original,
            imagen_Url: item.imagen_url
          } as PerfumeAPI // Hacemos un "cast" para que TypeScript acepte este objeto parcial
        }));
      },
      error: (err) => console.error('Error al cargar la tabla desde DB:', err)
    });
  }

  // Carga la fecha de mañana por defecto en el formato correcto (YYYY-MM-DDTHH:mm)
  inicializarFechaPorDefecto(): void {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setMinutes(mañana.getMinutes() - mañana.getTimezoneOffset());
    this.fechaFinOferta = mañana.toISOString().slice(0, 16);
  }

  cargarPerfumes(): void {
    this.Ofertasadm.obtenerPerfumesInventario().subscribe({
      next: (data) => {
        this.perfumesInventario = data;
      },
      error: (error) => console.error('Error al cargar catálogo:', error)
    });
  }

  // --- CONTROL DE MODALES ---
  abrirModalOferta() { 
    this.modoEdicion = false;
    this.limpiarFormulario();
    this.isModalOfertaAbierto = true; 
  }
  cerrarModalOferta() { this.isModalOfertaAbierto = false; this.limpiarFormulario(); }

  abrirModalReloj() {
    // Antes de abrir, consultamos la base de datos
    this.Ofertasadm.obtenerRelojCliente().subscribe({
      next: (config) => {
        if (config && config.fechaFinOferta) {
          // Convertimos la fecha al formato del input: YYYY-MM-DDTHH:mm
          const fechaDB = new Date(config.fechaFinOferta);
          
          // Ajuste de zona horaria para que el input muestre la hora correcta local
          fechaDB.setMinutes(fechaDB.getMinutes() - fechaDB.getTimezoneOffset());
          this.fechaFinOferta = fechaDB.toISOString().slice(0, 16);
        }
        this.isModalRelojAbierto = true;
      },
      error: (err) => {
        console.error('Error al obtener la fecha guardada:', err);
        // Si falla, abrimos con la fecha por defecto para no bloquear al admin
        this.inicializarFechaPorDefecto();
        this.isModalRelojAbierto = true;
      }
    });
  }
  cerrarModalReloj() { this.isModalRelojAbierto = false; }

  // --- LÓGICA MATEMÁTICA PROTEGIDA ---
  validarYCalcular(event: any): void {
    let inputElement = event.target;
    let valorEscrito = parseInt(inputElement.value, 10);

    // Evitar errores si borran todo
    if (isNaN(valorEscrito)) {
      this.porcentajeDescuento = 0; 
      this.precioCalculado = this.perfumeSeleccionado ? this.perfumeSeleccionado.precio : 0;
      return;
    }

    // Límite estricto de 1 a 100
    if (valorEscrito > 100) {
      inputElement.value = 100; 
      this.porcentajeDescuento = 100;
    } else if (valorEscrito < 1) {
      inputElement.value = 1;   
      this.porcentajeDescuento = 1;
    } else {
      this.porcentajeDescuento = valorEscrito;
    }

    // Aplicar descuento
    if (this.perfumeSeleccionado) {
      const descuentoSuma = (this.perfumeSeleccionado.precio * this.porcentajeDescuento) / 100;
      this.precioCalculado = this.perfumeSeleccionado.precio - descuentoSuma;
    } else {
      this.precioCalculado = 0;
    }
  }

  //agregar ofertas
  agregarOferta(): void {
    if (!this.perfumeSeleccionado || this.porcentajeDescuento <= 0) {
      this.mostrarAlertaElegante('Por favor selecciona un perfume y un descuento válido', 'warning');
      return;
    }

    this.Ofertasadm.guardarOferta(
      this.perfumeSeleccionado.idPerfume, 
      this.porcentajeDescuento, 
      this.precioCalculado
    ).subscribe({
      next: (respuesta) => {
        console.log('Oferta guardada en DB:', respuesta);
        
        // En lugar de hacer "push", volvemos a consultar la DB para tener el ID real generado
        this.cargarTablaDesdeDB();
        
        this.cerrarModalOferta();
        this.mostrarAlertaElegante('¡Oferta publicada exitosamente!', 'success');
      },
      error: (error) => {
        console.error('Error al guardar oferta:', error);
        this.mostrarAlertaElegante('No se pudo guardar la oferta.', 'error');
      }
    });
  }

  // NUEVA FUNCIÓN PARA EL BOTÓN EDITAR
  editarOferta(oferta: OfertaItem): void {
    this.modoEdicion = true;
    
    // Buscamos el perfume completo en el inventario para que el <select> lo reconozca
    this.perfumeSeleccionado = this.perfumesInventario.find(p => p.idPerfume === oferta.idPerfume) || oferta.perfume;
    
    this.porcentajeDescuento = oferta.descuento;
    this.precioCalculado = oferta.precioOferta;
    
    this.isModalOfertaAbierto = true;
  }

  //estados
  toggleEstadoOferta(oferta: OfertaItem): void {
    const nuevoEstado = !oferta.activo;
    const idReal = oferta.idTemporal; // Sacamos el id de la oferta que guardamos al mapear

    if (!idReal) return; // Si por alguna razón no hay ID, no hacemos nada

    // Llamamos a la API para guardar el cambio
    this.Ofertasadm.cambiarEstadoOferta(idReal, nuevoEstado).subscribe({
      next: () => {
        // Solo si la DB responde OK, cambiamos el color/estado en el frontend
        oferta.activo = nuevoEstado; 
        console.log(`Estado cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}`);
      },
      error: (err) => {
        console.error('No se pudo cambiar el estado en la DB', err);
        this.mostrarAlertaElegante('Hubo un error al actualizar el estado de la oferta.', 'error');
      }
    });
  }

  guardarConfiguracionReloj(): void {
    if (!this.fechaFinOferta) {
      this.mostrarAlertaElegante('Por favor, selecciona una fecha válida', 'warning');
      return;
    }

    // Llamamos al servicio pasando la fecha del input datetime-local
    this.Ofertasadm.guardarConfiguracionReloj(this.fechaFinOferta).subscribe({
      next: (res) => {
        console.log('¡Reloj actualizado en el servidor!', res);
        this.mostrarAlertaElegante('La duración de la oferta se ha actualizado con éxito.', 'success');
        this.cerrarModalReloj();
      },
      error: (error) => {
        console.error('Error al conectar con la API del reloj:', error);
        this.mostrarAlertaElegante('Hubo un error al guardar la fecha. Revisa la consola.', 'error');
      }
    });
  }

  limpiarFormulario(): void {
    this.perfumeSeleccionado = null;
    this.porcentajeDescuento = 1;
    this.precioCalculado = 0;
  }
}