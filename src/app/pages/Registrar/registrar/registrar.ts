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

  // 🛡️ NUEVA FUNCIÓN: El "cadenero" estricto de seguridad
  validarFormularioSeguro(): boolean {
    // 1. Validar campos vacíos primero
    if (!this.usuario.nombre || !this.usuario.apellidos || !this.usuario.correo || !this.usuario.contrasena) {
      this.mostrarAlertaElegante('Por favor llena todos los campos obligatorios.', 'warning');
      return false;
    }

    // 2. Validar Nombre y Apellidos (Solo letras y espacios, acepta acentos)
    const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!letrasRegex.test(this.usuario.nombre)) {
      this.mostrarAlertaElegante('El nombre no es válido. Usa solo letras y espacios.', 'warning');
      return false;
    }
    if (!letrasRegex.test(this.usuario.apellidos)) {
      this.mostrarAlertaElegante('Los apellidos no son válidos. Usa solo letras y espacios.', 'warning');
      return false;
    }

    // 3. Validar Correo Electrónico (Formato real)
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!correoRegex.test(this.usuario.correo)) {
      this.mostrarAlertaElegante('Por favor ingresa un correo electrónico real (ejemplo@correo.com).', 'warning');
      return false;
    }

    // 4. Validar Contraseña Segura (El terror de los hackers)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(this.usuario.contrasena)) {
      this.mostrarAlertaElegante('Tu contraseña debe tener mínimo 8 caracteres, incluir una mayúscula, un número y un símbolo especial (ej. @, #, !).', 'warning');
      return false;
    }

    // 5. Confirmar Contraseña
    if (this.usuario.contrasena !== this.usuario.confirmarContrasena) {
      this.mostrarAlertaElegante('Las contraseñas no coinciden.', 'error');
      return false;
    }

    return true; // Si todo está perfecto, regresa un 'OK'
  }

  registrar() {
    // 🛑 Llamamos a nuestro "cadenero" ANTES de hacer cualquier otra cosa
    if (!this.validarFormularioSeguro()) {
      return; // Si la validación falla, se corta la función y no manda nada
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
    // ⚠️ ATENCIÓN AQUÍ: Si esto ya está subido a Vercel, recuerda cambiar "localhost:7030" 
    // por el link real de tu Back-End en Railway (ej. https://back-end-donaruma.up.railway.app/...)
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