import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface UserProfile {
  nombreCompleto: string;
  direccionUsuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {
  private http = inject(HttpClient);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  
  public userProfile$ = this.userProfileSubject.asObservable();
  
  constructor() {
    this.loadUserProfileIfAuthenticated();
  }

  isLoggedIn(): boolean {
    // 1. Verificamos si existe el ID inofensivo que guardamos en el login
    return !!localStorage.getItem('userId');
  }

  getUserId(): string | null {
    // 2. Leemos el ID directamente del localStorage
    return localStorage.getItem('userId');
  }

  getUserRole(): string | null {
    // 3. Leemos el Rol directamente del localStorage
    return localStorage.getItem('userRole');
  }

  fetchUserProfile(): Observable<UserProfile> {
    const id = this.getUserId();
    if (!id) throw new Error('No user ID found');
    
    // 4. Hacemos la petición con withCredentials para que el servidor lea nuestra Cookie secreta
    return this.http.get<UserProfile>(`https://back-end-donaruma-production-ac0c.up.railway.app/api/UsuariosInf/datos/${id}`, { withCredentials: true }).pipe(
      tap(profile => this.userProfileSubject.next(profile))
    );
  }

  loadUserProfileIfAuthenticated() {
    if (this.isLoggedIn()) {
      this.fetchUserProfile().subscribe({
        error: (err) => console.log('Could not load user profile', err)
      });
    }
  }

  clearStorage(): void {
    // 5. Limpiamos solo los datos inofensivos al cerrar sesión
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    this.userProfileSubject.next(null);
  }
}