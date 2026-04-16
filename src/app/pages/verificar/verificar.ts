import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verificar-container">
      <div class="card" *ngIf="estado === 'cargando'">
        <h2>Verificando tu cuenta...</h2>
        <p>Por favor, espera un momento.</p>
      </div>

      <div class="card success" *ngIf="estado === 'exito'">
        <h2>¡Cuenta Activada! 🎉</h2>
        <p>Tu correo ha sido verificado con éxito. Ya puedes disfrutar de Dunaroma.</p>
        <button routerLink="/login">Ir al Inicio de Sesión</button>
      </div>

      <div class="card error" *ngIf="estado === 'error'">
        <h2>Vaya, algo salió mal ❌</h2>
        <p>{{ mensajeError }}</p>
        <button routerLink="/registro">Intentar registrarme de nuevo</button>
      </div>
    </div>
  `,
  styles: [`
    .verificar-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #111827; color: white; text-align: center; }
    .card { background: #1f2937; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    button { background: #fbbf24; color: #111827; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 20px; }
  `]
})
export class VerificarComponent implements OnInit {
  estado: 'cargando' | 'exito' | 'error' = 'cargando';
  mensajeError: string = '';

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    // 1. Extraemos el token de la URL: ?token=abc-123
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.estado = 'error';
      this.mensajeError = 'No se encontró un token válido en el enlace.';
      return;
    }

    // 2. Se lo enviamos al Back-End
    this.http.get(`https://localhost:7030/api/Usuarios/confirmar?token=${token}`).subscribe({
      next: (res: any) => {
        this.estado = 'exito';
      },
      error: (err) => {
        this.estado = 'error';
        this.mensajeError = err.error?.mensaje || 'El enlace es inválido o ya caducó.';
      }
    });
  }
}