import { Component, OnInit, inject, signal, HostListener } from '@angular/core'; // 🔥 Agregamos HostListener
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
    // 1. Limpiamos las variables de Angular para que la UI se borre
    this.appStorage.clearStorage();
    this.isMenuOpen = false;
    
    // 2. Usamos replace() en lugar de href(). 
    // Replace borra el registro de la página actual del historial del navegador,
    // haciendo mucho más difícil regresar a ella.
    window.location.replace('/'); 
  }
}