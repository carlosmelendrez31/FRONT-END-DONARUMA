import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppStorageService } from '../../../core/services/app-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  correo: string = '';
  contrasena: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  shPassword = false;

  private authService = inject(AuthService);
  private appStorage = inject(AppStorageService);
  private router = inject(Router);

  togglePasswordVisibility() {
    this.shPassword = !this.shPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.shPassword ? 'text' : 'password';
    }
  }

  login() {
    this.errorMessage = '';

    if (!this.correo || !this.contrasena) {
      Swal.fire({ title: 'Aviso', text: 'Por favor, ingresa tu correo y contraseña.', icon: 'warning', background: '#111827', color: '#ffffff' });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.exito) {
          this.authService.setTokens(response.accessToken, response.refreshToken);
          this.appStorage.loadUserProfileIfAuthenticated();
          
          const role = this.appStorage.getUserRole();
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/inicio']);
          }
        } else {
          Swal.fire({ title: 'Error', text: response.mensaje || 'Error al iniciar sesión', icon: 'error', background: '#111827', color: '#ffffff' });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        let msg = 'Ocurrió un error al intentar conectarse al servidor.';
        if (error.status === 401 || error.status === 400 || error.status === 404) {
            msg = error.error?.mensaje || error.error?.message || 'Correo o contraseña incorrectos.';
        }
        Swal.fire({ title: 'Error', text: msg, icon: 'error', background: '#111827', color: '#ffffff', confirmButtonColor: '#fbbf24' });
      }
    });
  }
}
