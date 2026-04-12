import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { NovedadesService } from '../../../core/services/novedades';

@Component({
  selector: 'app-admin-novedades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './admin-novedades.html',
  styleUrl: './admin-novedades.css'
})
export class AdminNovedadesComponent implements OnInit {
  nuevaNovedad: any = { titulo: '', descripcion: '', imagenUrl: '' }; 
  cargando: boolean = false;
  mensaje: string = '';
  listaPublicaciones: any[] = []; 

  // Variables de control de edición
  editando: boolean = false;
  idEditando: number | null = null;

  // 👇 NUEVAS VARIABLES PARA EL MODAL PRO 👇
  mostrarConfirmarBorrar = false;
  idParaBorrar: number | null = null;

  private novedadesService = inject(NovedadesService);

  ngOnInit() {
    this.cargarPublicaciones(); 
  }

  cargarPublicaciones() {
    this.novedadesService.obtenerTodas().subscribe({
      next: (data: any) => this.listaPublicaciones = data,
      error: (err: any) => console.error('Error al cargar la lista', err)
    });
  }

  editarPublicacion(pub: any) {
    this.editando = true;
    this.idEditando = pub.idNovedad;
    this.nuevaNovedad = { ...pub };
    this.mensaje = '✏️ Modo edición activado.';
  }

  cancelarEdicion() {
    this.editando = false;
    this.idEditando = null;
    this.nuevaNovedad = { titulo: '', descripcion: '', imagenUrl: '' };
    this.mensaje = '';
  }

  guardarNovedad() {
    if (!this.nuevaNovedad.titulo || !this.nuevaNovedad.descripcion || !this.nuevaNovedad.imagenUrl) {
      this.mensaje = '⚠️ Llena todos los campos.';
      return;
    }

    this.cargando = true;
    if (this.editando && this.idEditando) {
      this.novedadesService.actualizar(this.idEditando, this.nuevaNovedad).subscribe({
        next: () => {
          this.mensaje = '✅ Actualizado correctamente.';
          this.finalizarProceso();
        },
        error: () => (this.cargando = false)
      });
    } else {
      this.novedadesService.crearNovedad(this.nuevaNovedad).subscribe({
        next: () => {
          this.mensaje = '✅ Publicado con éxito.';
          this.finalizarProceso();
        },
        error: () => (this.cargando = false)
      });
    }
  }

  finalizarProceso() {
    this.cargando = false;
    this.cancelarEdicion();
    this.cargarPublicaciones();
  }

  // --- LÓGICA DEL MODAL PRO ---
  eliminarPublicacion(id: number) {
    this.idParaBorrar = id;
    this.mostrarConfirmarBorrar = true;
  }

  confirmarBorrado() {
    if (this.idParaBorrar) {
      this.novedadesService.eliminar(this.idParaBorrar).subscribe({
        next: () => {
          this.mensaje = '🗑️ Eliminado con éxito.';
          this.cargarPublicaciones();
          this.cancelarBorrado();
        }
      });
    }
  }

  cancelarBorrado() {
    this.mostrarConfirmarBorrar = false;
    this.idParaBorrar = null;
  }
}