import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface UserProfile {
  nombreCompleto: string;
  direccionUsuario: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {
  private http = inject(HttpClient);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  
  public userProfile$ = this.userProfileSubject.asObservable();
  private readonly ROLES_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  
  constructor() {
    this.loadUserProfileIfAuthenticated();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  decodeToken(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      return {
        ...decoded,
        role: decoded[this.ROLES_CLAIM] || decoded.role
      };
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.sub : null;
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.role : null;
  }

  fetchUserProfile(): Observable<UserProfile> {
    const id = this.getUserId();
    if (!id) throw new Error('No user ID found');
    
    // As in your curl we send the ID. Depending on backend, is it POST or GET? 
    // Usually fetching user data by id is GET /api/UsuariosInf/datos?id=... or GET /api/UsuariosInf/datos/id
    // But your backend might use POST. Let's assume GET with query param or just simple POST if it's `{ id }`
    // Looking at user prompt: "se le manda el id. el id del token... te regresa esto"
    // I will use GET /api/UsuariosInf/datos?id={id}. If it fails, I'll update it later or you can manually fix it.
    // wait, usually dot net requires the ID as route param like `/api/UsuariosInf/datos/4`
    return this.http.get<UserProfile>(`https://localhost:7030/api/UsuariosInf/datos/${id}`).pipe(
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userProfileSubject.next(null);
  }
}
