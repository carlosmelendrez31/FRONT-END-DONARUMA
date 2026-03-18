import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfumeService } from '../../../../core/services/perfume';

@Component({
  selector: 'app-agregarperfume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregarperfume.html',
  styleUrl: './agregarperfume.css',
})
export class Agregarperfume implements OnInit {

  listaPerfumes: any[] = [];
  textoBusqueda: string = '';
  mostrarModal: boolean = false;

  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'error' | 'warning' = 'success';

  mostrarConfirmacionEliminar: boolean = false;
  perfumeAEliminar: any = null;

  nuevoPerfume: any = this.limpiarDatos();

  constructor(private perfumeService: PerfumeService) { }

  ngOnInit(): void {
    this.cargarPerfumes();
  }

  lanzarAlerta(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.mostrarAlerta = true;
    setTimeout(() => { this.mostrarAlerta = false; }, 3000);
  }

  get perfumesFiltrados() {
    if (!this.textoBusqueda) return this.listaPerfumes;
    return this.listaPerfumes.filter(p => {
      const nombre = (p.nombre || p.Nombre || '').toLowerCase();
      const marca = (p.marca || p.Marca || '').toLowerCase();
      return nombre.includes(this.textoBusqueda.toLowerCase()) || marca.includes(this.textoBusqueda.toLowerCase());
    });
  }

  cargarPerfumes() {
    this.perfumeService.obtenerTodos().subscribe({
      next: (datos: any[]) => {
        this.listaPerfumes = datos.map(p => {
          // Ya que arreglamos el C#, ahora llegará limpio como p.nombre o p.Nombre
          return {
            idPerfume: p.idperfume || p.idPerfume || p.IdPerfume,
            nombre: p.nombre || p.Nombre, 
            marca: p.marca || p.Marca,
            precio: p.precio || p.Precio,
            descripcion: p.descripcion || p.Descripcion,
            imagen_Url: p.imagen_url || p.imagen_Url || p.Imagen_Url,
            stock: p.stock || p.Stock,
            genero: p.genero || p.Genero,
            ocasion: p.ocasion || p.Ocasion,
            intensidad: p.intensidad ?? 50,
            dulzor: p.dulzor ?? 50,
            duracion: p.duracion ?? 50,
            aromatico: p.aromatico ?? 50
          };
        });
      },
      error: () => this.lanzarAlerta('Error al cargar datos', 'error')
    });
  }

  guardarPerfume() {
    if (!this.nuevoPerfume.nombre || !this.nuevoPerfume.marca || !this.nuevoPerfume.precio) {
      this.lanzarAlerta('Faltan campos obligatorios', 'warning');
      return;
    }

    // Empaquetamos todo EXACTO para el C#
    const perfumeAEnviar = {
      IdPerfume: this.nuevoPerfume.idPerfume || 0,
      Nombre: this.nuevoPerfume.nombre,
      Marca: this.nuevoPerfume.marca,
      Precio: this.nuevoPerfume.precio,
      Descripcion: this.nuevoPerfume.descripcion || '',
      Imagen_Url: this.nuevoPerfume.imagen_Url || '',
      Stock: this.nuevoPerfume.stock || 0,
      Genero: this.nuevoPerfume.genero || 'Hombre',
      Ocasion: this.nuevoPerfume.ocasion || 'Día',
      Intensidad: this.nuevoPerfume.intensidad,
      Dulzor: this.nuevoPerfume.dulzor,
      Duracion: this.nuevoPerfume.duracion,
      Aromatico: this.nuevoPerfume.aromatico
    };

    const id = perfumeAEnviar.IdPerfume;

    if (id && id !== 0) {
      this.perfumeService.actualizarPerfume(id, perfumeAEnviar).subscribe({
        next: () => {
          this.lanzarAlerta('Guardado exitosamente', 'success');
          this.recargar();
        },
        error: () => this.lanzarAlerta('Error al guardar en el servidor', 'error')
      });
    } else {
      this.perfumeService.crearPerfume(perfumeAEnviar).subscribe({
        next: () => {
          this.lanzarAlerta('Creado exitosamente', 'success');
          this.recargar();
        },
        error: () => this.lanzarAlerta('Error al crear el perfume', 'error')
      });
    }
  }

  editarPerfume(p: any) {
    this.nuevoPerfume = { ...p };
    this.mostrarModal = true;
  }

  abrirConfirmacionEliminar(p: any) {
    this.perfumeAEliminar = p;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminacion() {
    this.mostrarConfirmacionEliminar = false;
    this.perfumeAEliminar = null;
  }

  ejecutarEliminacion() {
    if (!this.perfumeAEliminar) return;
    const id = this.perfumeAEliminar.idPerfume;
    
    this.perfumeService.eliminarPerfume(id).subscribe({
      next: () => {
        this.lanzarAlerta('Eliminado exitosamente', 'success');
        this.cargarPerfumes();
        this.mostrarConfirmacionEliminar = false;
        this.perfumeAEliminar = null;
      },
      error: () => {
        this.lanzarAlerta('No se puede eliminar: Tiene ventas registradas', 'error');
        this.mostrarConfirmacionEliminar = false;
      }
    });
  }

  abrirModal() { this.nuevoPerfume = this.limpiarDatos(); this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }
  recargar() { this.cargarPerfumes(); this.cerrarModal(); }

  limpiarDatos() {
    return {
      nombre: '', marca: '', genero: 'Hombre', ocasion: 'Día',
      precio: null, stock: null, descripcion: '', imagen_Url: '',
      intensidad: 50, dulzor: 50, duracion: 50, aromatico: 50
    };
  }
}