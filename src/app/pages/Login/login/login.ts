import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppStorageService } from '../../../core/services/app-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy {
  // Variables del Formulario
  correo: string = '';
  contrasena: string = '';

  // Estados de la Interfaz (UI)
  isLoading: boolean = false;
  shPassword = false;
  errorCampoInvalido: boolean = false;

  // Sistema de Alertas (Toasts)
  notificacionesError: string[] = [];
  notificacionesExito: string[] = [];

  // Variables del Carrusel
  imagenesCarrusel: string[] = [
    'https://i.postimg.cc/MZhZ60hN/Duna2.jpg', 
    'https://i.postimg.cc/fRvMfGJ9/duna3.jpg', 
    'https://i.postimg.cc/QtQmFJfk/Dunaroma.png'  
  ];
  imagenActualIndex: number = 0;
  intervaloCarrusel: any;

  // Inyección de Servicios
  private authService = inject(AuthService);
  private appStorage = inject(AppStorageService);
  private router = inject(Router);

  ngOnInit() {
    // 🛡️ EL DOBLE ESCUDO ANTI-FANTASMAS
    // Si la persona usa la flecha de "Atrás" para llegar al Login, pero el sistema 
    // detecta que en realidad SÍ tiene una sesión activa, lo regresamos a su cuenta.
    if (this.appStorage.isLoggedIn()) {
      const role = this.appStorage.getUserRole();
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/inicio']);
      }
      return; // 🛑 Detenemos la ejecución aquí para que no cargue el formulario
    }

    // 🔥 Arrancamos el carrusel para que cambie cada 4 segundos
    this.intervaloCarrusel = setInterval(() => {
      this.imagenActualIndex = (this.imagenActualIndex + 1) % this.imagenesCarrusel.length;
    }, 4000);
  }

  ngOnDestroy() {
    // Limpiamos el carrusel cuando cambiamos de pantalla
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
    }
  }

  togglePasswordVisibility() {
    this.shPassword = !this.shPassword;
  }

  login() {
    // 1. Validaciones locales (Campos vacíos)
    if (!this.correo || !this.contrasena) {
      this.errorCampoInvalido = true;
      this.mostrarError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    this.errorCampoInvalido = false;
    this.isLoading = true;

    // 2. Petición real al Back-End en C#
    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (response: any) => {
        if (response.exito) {
          
          if (response.idUsuario) {
            localStorage.setItem('userId', response.idUsuario.toString());
          }
          if (response.rol) {
            localStorage.setItem('userRole', response.rol);
          }

          this.appStorage.loadUserProfileIfAuthenticated();
          
          this.mostrarExito('¡Acceso concedido! Validando credenciales...');

          setTimeout(() => {
            this.isLoading = false;
            const role = this.appStorage.getUserRole();
            
            if (role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/inicio']);
            }
          }, 1000);
          
        } else {
          this.isLoading = false;
          this.mostrarError(response.mensaje || 'Error al iniciar sesión');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.error && error.error.mensaje) {
          this.mostrarError(error.error.mensaje);
        } else {
          this.mostrarError('Ocurrió un error al intentar conectarse al servidor.');
        }
      }
    });
  }

  // =========================================
  // FUNCIONES PARA CONTROLAR ALERTAS (TOASTS)
  // =========================================
  mostrarError(mensaje: string) {
    this.notificacionesError.push(mensaje);
    setTimeout(() => {
      this.notificacionesError.shift();
    }, 4000);
  }

  mostrarExito(mensaje: string) {
    this.notificacionesExito.push(mensaje);
    setTimeout(() => {
      this.notificacionesExito.shift();
    }, 4000);
  }
}