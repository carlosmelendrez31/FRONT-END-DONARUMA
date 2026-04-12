import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar.html',
  styleUrls: ['./registrar.css']
})
export class Registrar {
  private http = inject(HttpClient);
  private router = inject(Router);

  // El "molde" donde guardamos lo que el usuario escribe
  usuario = {
    nombre: '',
    apellidos: '',
    direccion: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  registrar() {
    // 1. Validamos que no dejen campos vacíos
    if (!this.usuario.nombre || !this.usuario.apellidos || !this.usuario.correo || !this.usuario.contrasena) {
      this.mostrarAlertaElegante('Por favor llena todos los campos obligatorios.', 'warning');
      return;
    }

    // 2. Validamos que no se hayan equivocado al escribir la contraseña
    if (this.usuario.contrasena !== this.usuario.confirmarContrasena) {
      this.mostrarAlertaElegante('Las contraseñas no coinciden.', 'error');
      return;
    }

    // 3. Armamos el paquete EXACTO para tu CrearUsuarioDTO de C#
    const payload = {
      nombre: this.usuario.nombre,
      apellidos: this.usuario.apellidos,
      direccion: this.usuario.direccion,
      correo: this.usuario.correo,
      contrasena: this.usuario.contrasena,
      rol: 'cliente' // 🔒 AQUÍ ESTÁ EL TRUCO: Le asignamos el rol por defecto
    };

    // 4. Lo mandamos a tu Back-End
    this.http.post('https://localhost:7030/api/Usuarios/crear', payload).subscribe({
      next: (res: any) => {
        this.mostrarAlertaElegante('¡Cuenta creada con éxito! Bienvenido a Dunaroma.', 'success');
        // Los mandamos de regreso al login para que inicien sesión
        this.router.navigate(['/']); 
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.mostrarAlertaElegante('Hubo un problema al crear tu cuenta. Intenta con otro correo.', 'error');
      }
    });
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
}