import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../core/services/perfil.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfilComponent implements OnInit {

  perfil: any = {
    nombre_Completo: '',
    nombre: '',
    apellidos: '',
    correo: '',
    direccion: ''
  };

  cambioPwd = {
    contrasenaActual: '',
    nuevaContrasena: ''
  };

  historial: any[] = [];

  constructor(private perfilService: PerfilService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.perfilService.getPerfil().subscribe({
      next: (data) => {
        if(data) {
          this.perfil = {
            nombre_Completo: data.nombre_Completo,
            nombre: data.nombre,
            apellidos: data.apellidos,
            correo: data.correo,
            direccion: data.direccion || ''
          };
        }
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
      }
    });

    this.perfilService.getHistorialCompras().subscribe({
      next: (compras) => {
        this.historial = compras || [];
      },
      error: (err) => {
        console.error('Error cargando historial', err);
      }
    });
  }

  guardarPerfil() {
    if(!this.perfil.nombre || !this.perfil.correo) {
      Swal.fire({ title: 'Aviso', text: 'El nombre y correo son obligatorios.', icon: 'warning', background: '#111827', color: '#ffffff' });
      return;
    }
    
    const payload = {
      nombre: this.perfil.nombre,
      apellidos: this.perfil.apellidos,
      correo: this.perfil.correo,
      direccion: this.perfil.direccion
    };

    this.perfilService.actualizarPerfil(payload).subscribe({
      next: (res) => {
        Swal.fire({ title: '¡Éxito!', text: 'Perfil actualizado correctamente.', icon: 'success', background: '#111827', color: '#ffffff', confirmButtonColor: '#fbbf24' });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'Error al actualizar el perfil.', icon: 'error', background: '#111827', color: '#ffffff' });
      }
    });
  }

  guardarContrasena() {
    if(!this.cambioPwd.contrasenaActual || !this.cambioPwd.nuevaContrasena) {
      Swal.fire({ title: 'Aviso', text: 'Ambas contraseñas son requeridas.', icon: 'warning', background: '#111827', color: '#ffffff' });
      return;
    }

    this.perfilService.cambiarContrasena(this.cambioPwd.contrasenaActual, this.cambioPwd.nuevaContrasena).subscribe({
      next: (res) => {
        Swal.fire({ title: '¡Éxito!', text: 'Contraseña actualizada correctamente.', icon: 'success', background: '#111827', color: '#ffffff', confirmButtonColor: '#fbbf24' });
        this.cambioPwd = { contrasenaActual: '', nuevaContrasena: '' };
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'Contraseña actual incorrecta o error en el servidor.', icon: 'error', background: '#111827', color: '#ffffff' });
      }
    });
  }
}
