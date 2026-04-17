import { Component, OnInit, inject, signal } from '@angular/core';
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
        error: () => this.handleLogoutSuccess() // Limpiar incluso si falla en back
      });
    } else {
      this.handleLogoutSuccess();
    }
  }

  private handleLogoutSuccess() {
    this.appStorage.clearStorage();
    this.isMenuOpen = false;
    window.location.href = '/'; 
  }
}
