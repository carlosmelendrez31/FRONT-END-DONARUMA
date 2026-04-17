import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { Router } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service'; 

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,                             
  imports: [CommonModule, FormsModule],         
  templateUrl: './verificar-codigo.html',
  styleUrls: ['./verificar-codigo.css']
})
export class VerificarCodigoComponent {
  
  codigo: string = '';
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  verificar() {
    if (!this.codigo.trim()) {
      this.mensajeError = 'Por favor, ingresa el código.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    
    this.usuarioService.confirmarCuenta(this.codigo.trim()).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.mensajeExito = '¡Cuenta verificada con éxito! Redirigiendo...';
        
        
        setTimeout(() => {
          this.router.navigate(['/login']); // Ajusta la ruta de tu login si es diferente
        }, 2000);
      },
      error: (err) => {
        this.cargando = false;
        
        this.mensajeError = err.error?.mensaje || 'Error al verificar el código. Intenta de nuevo.';
      }
    });
  }
}