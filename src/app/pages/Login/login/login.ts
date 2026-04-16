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
      next: (response: any) => {
        this.isLoading = false;
        
        // 👀 Imprimimos la respuesta para ver qué mandó C#
        console.log('Login Exitoso, respuesta:', response);
        
        // 🔒 Guardamos datos inofensivos
        localStorage.setItem('userRole', response.rol || 'cliente');
        localStorage.setItem('userId', response.idUsuario?.toString() || '');

        // Disparamos la carga del perfil
        this.appStorage.loadUserProfileIfAuthenticated();
          
        // Hacemos la redirección
        if (response.rol === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          // 👇 Lo cambié a '/' para que te lleve directo a la raíz de tu tienda
          this.router.navigate(['/inicio']); 
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        // Si hay error (401 Unauthorized), mostramos el mensaje que manda C#
        this.errorMessage = error.error?.mensaje || 'Correo o contraseña incorrectos.';
      }
    });
  }
}