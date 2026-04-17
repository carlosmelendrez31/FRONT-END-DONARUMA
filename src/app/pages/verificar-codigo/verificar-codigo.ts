import { Component, OnInit } from '@angular/core'; // 👈 1. Importamos OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // 👈 2. Importamos ActivatedRoute
import { UsuarioService } from '../../core/services/usuario.service'; 

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificar-codigo.html',
  styleUrls: ['./verificar-codigo.css']
})
export class VerificarCodigoComponent implements OnInit { // 👈 3. Agregamos implements OnInit
  codigo: string = '';
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute // 👈 4. Inyectamos el lector de rutas
  ) {}

  // 👇 5. Esta función se ejecuta apenas carga la página 👇
  ngOnInit() {
    // Revisamos si la URL trae un "?token=algo"
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.codigo = params['token']; // Escribimos el código en el input automáticamente
        this.verificar(); // ¡Le damos clic al botón verificar por el usuario!
      }
    });
  }

  verificar() {
    if (!this.codigo.trim()) {
      this.mensajeError = 'Por favor, ingresa el código.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    
    this.usuarioService.confirmarCuenta(this.codigo.trim()).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
        this.mensajeExito = '¡Cuenta verificada con éxito! Redirigiendo...';
        
        setTimeout(() => {
          this.router.navigate(['/']); 
        }, 2000);
      },
      error: (err: any) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Error al verificar el código. Intenta de nuevo.';
      }
    });
  }
}