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

  // 🔥 NUEVO: Variables del Carrusel
  imagenesCarrusel: string[] = [
    'https://i.postimg.cc/MZhZ60hN/Duna2.jpg', // Escena de montaña 1
    'https://i.postimg.cc/fRvMfGJ9/duna3.jpg', // Escena de montaña 2
    'https://i.postimg.cc/QtQmFJfk/Dunaroma.png'  // Escena de montaña 3
  ];
  imagenActualIndex: number = 0;
  intervaloCarrusel: any;

  // Inyección de Servicios
  private authService = inject(AuthService);
  private appStorage = inject(AppStorageService);
  private router = inject(Router);

  ngOnInit() {
    // 🔥 NUEVO: Arrancamos el carrusel para que cambie cada 4 segundos
    this.intervaloCarrusel = setInterval(() => {
      this.imagenActualIndex = (this.imagenActualIndex + 1) % this.imagenesCarrusel.length;
    }, 4000);
  }

  ngOnDestroy() {
    // 🔥 NUEVO: Limpiamos el carrusel cuando cambiamos de pantalla
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

    // Si pasamos la validación local, limpiamos los bordes rojos y activamos el loader
    this.errorCampoInvalido = false;
    this.isLoading = true;

    // 2. Petición real al Back-End en C#
    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (response: any) => {
        if (response.exito) {
          
          // 🔒 MÁXIMA SEGURIDAD: 
          // Ya NO tocamos los tokens. El navegador los guarda solos (HttpOnly Cookies).
          // Solo guardamos la información inofensiva para que la interfaz sepa quién entró:
          if (response.idUsuario) {
            localStorage.setItem('userId', response.idUsuario.toString());
          }
          if (response.rol) {
            localStorage.setItem('userRole', response.rol);
          }

          this.appStorage.loadUserProfileIfAuthenticated();
          
          this.mostrarExito('¡Acceso concedido! Validando credenciales...');

          // Damos un pequeño retraso (1 segundo) para que la alerta verde se alcance a ver
          // antes de saltar a la otra pantalla
          setTimeout(() => {
            this.isLoading = false;
            const role = this.appStorage.getUserRole();
            
            // Tu lógica inteligente de redirección
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
        
        // Atrapamos si C# nos mandó un mensaje de error específico
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
    // Borramos el mensaje después de 4 segundos
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