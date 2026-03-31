import { Component, inject } from '@angular/core';
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
      this.errorMessage = 'Por favor, ingresa tu correo y contraseña.';
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
          this.errorMessage = response.mensaje || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = 'Ocurrió un error al intentar conectarse al servidor.';
      }
    });
  }
}
