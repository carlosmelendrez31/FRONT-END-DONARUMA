import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStorageService } from './core/services/app-storage.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Frontend-Donaruma');
  
  appStorage = inject(AppStorageService);
  authService = inject(AuthService);
  router = inject(Router);

  isMenuOpen = false;

  // 🛡️ EL GUARDIÁN DEL BOTÓN ATRÁS (BFCache)
  // Este código se dispara cada vez que la página se muestra, INCLUSO si 
  // el usuario usa la flecha de "Atrás" y Chrome intenta mostrar una foto vieja.
  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: any) {
    // Si la página viene de la memoria caché (flecha de atrás) Y el usuario ya no tiene sesión:
    if (event.persisted && !this.appStorage.isLoggedIn()) {
      // Destruimos la foto vieja y forzamos a recargar en el login
      window.location.reload(); 
    }
  }

  ngOnInit() {
    this.appStorage.loadUserProfileIfAuthenticated();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    const id = this.appStorage.getUserId();
    if (id) {
      this.authService.logout().subscribe({
        next: () => this.handleLogoutSuccess(),
        error: () => this.handleLogoutSuccess() 
      });
    } else {
      this.handleLogoutSuccess();
    }
  }

  private handleLogoutSuccess() {
    // 1. Destruimos toda la memoria local sin piedad
    localStorage.clear();
    sessionStorage.clear();
    this.appStorage.clearStorage(); // Nos aseguramos de limpiar también tu servicio
    
    // 2. Destruimos cualquier cookie residual del frontend
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    this.isMenuOpen = false;

    
    window.location.href = '/?sesion_cerrada=' + new Date().getTime(); 
  }
}