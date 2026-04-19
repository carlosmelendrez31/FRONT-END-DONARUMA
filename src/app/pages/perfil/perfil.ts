import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStorageService } from '../../core/services/app-storage.service';
import { UsuarioService } from '../../core/services/usuario.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  private appStorage = inject(AppStorageService);
  private usuarioService = inject(UsuarioService);

  // Guardamos el ID del usuario actual
  idUsuarioActual: number = 0;

  // Datos del Usuario
  perfil: any = {
    nombre: '',
    apellidos: '',
    correo: '',
    direccion: ''
  };

  // Variables para Contraseña
  passwords = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  // Estados de la UI
  editandoDireccion = false;
  cambiandoPassword = false;
  isLoading = false;
  mensajeAlerta = { texto: '', tipo: '' };

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  // ==========================================
  // 1. TRAER LOS DATOS DESDE POSTGRESQL (GET)
  // ==========================================
 cargarDatosUsuario() {
    this.appStorage.userProfile$.subscribe(userProfile => {
      if (userProfile) {
        const perfilSeguro = userProfile as any;
        
        // 🔒 LA SOLUCIÓN:
        // En lugar de depender de los nombres raros del JWT, usamos el método getUserId() 
        // de tu propio AppStorageService, que sabemos que funciona perfecto.
        const idReal = this.appStorage.getUserId();

        if (!idReal) {
          console.error("No se encontró el ID del usuario en la sesión.");
          return; // Si no hay ID, detenemos todo para no mostrar a un "impostor"
        }

        this.idUsuarioActual = Number(idReal);
        
        // El correo sí suele venir en el perfil, pero por si acaso:
        this.perfil.correo = perfilSeguro.correo || perfilSeguro.email || 'Cargando...';

        // Hacemos la llamada HTTP GET a C# con tu ID REAL
        this.usuarioService.obtenerUsuario(this.idUsuarioActual).subscribe({
          next: (datosBD: any) => {
            // Llenamos la pantalla con TU información real de PostgreSQL
            this.perfil.nombre = datosBD.nombre;
            this.perfil.apellidos = datosBD.apellidos;
            this.perfil.direccion = datosBD.direccion;
            
            // Si la BD devuelve el correo, lo sobreescribimos para mayor precisión
            if(datosBD.correo) {
                this.perfil.correo = datosBD.correo;
            }
          },
          error: (err) => {
            console.error('Error al cargar datos desde la BD:', err);
            this.mostrarNotificacion('Error al conectar con el servidor para traer tus datos.', 'error');
          }
        });
      }
    });
  }

  // ==========================================
  // 2. LÓGICA DE DIRECCIÓN Y PERFIL (PUT)
  // ==========================================
  toggleEditarDireccion() {
    this.editandoDireccion = !this.editandoDireccion;
  }

  guardarDireccion() {
    this.isLoading = true;

    // Armamos el objeto exactamente como lo espera tu DTO en C#
    const datosParaActualizar = {
      idUsuario: this.idUsuarioActual,
      nombre: this.perfil.nombre,
      apellidos: this.perfil.apellidos,
      direccion: this.perfil.direccion
    };

    // Llamada HTTP PUT real
    this.usuarioService.actualizarUsuario(datosParaActualizar).subscribe({
      next: (respuesta: any) => {
        this.isLoading = false;
        
        if (respuesta.exito) {
          this.editandoDireccion = false;
          this.mostrarNotificacion('Perfil actualizado correctamente en la base de datos.', 'exito');
        } else {
          this.mostrarNotificacion(respuesta.mensaje || 'No se pudo actualizar.', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al guardar:', err);
        this.mostrarNotificacion('Hubo un error de conexión al guardar.', 'error');
      }
    });
  }

  // ==========================================
  // 3. LÓGICA DE CONTRASEÑA
  // ==========================================
 passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  toggleCambiarPassword() {
    this.cambiandoPassword = !this.cambiandoPassword;
    this.passwords = { actual: '', nueva: '', confirmar: '' };
  }

  guardarPassword() {
    // 🛑 VALIDACIÓN 1: Que no dejen campos en blanco
    if (!this.passwords.actual || !this.passwords.nueva || !this.passwords.confirmar) {
      this.mostrarNotificacion('Por favor, completa todos los campos de contraseña.', 'error');
      return;
    }

    // 🛑 VALIDACIÓN 2: El Escudo de Contraseña Fuerte
    if (!this.passwordRegex.test(this.passwords.nueva)) {
      this.mostrarNotificacion('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.', 'error');
      return;
    }

    // 🛑 VALIDACIÓN 3: Que las contraseñas nuevas coincidan
    if (this.passwords.nueva !== this.passwords.confirmar) {
      this.mostrarNotificacion('Las contraseñas nuevas no coinciden.', 'error');
      return;
    }
    
    // Si pasa todos los guardias, encendemos el loading y mandamos a C#
    this.isLoading = true;

    const datosPassword = {
      idUsuario: this.idUsuarioActual,
      contrasenaActual: this.passwords.actual,
      contrasenaNueva: this.passwords.nueva
    };

    this.usuarioService.cambiarPassword(datosPassword).subscribe({
      next: (respuesta: any) => {
        this.isLoading = false;
        if (respuesta.exito) {
          this.cambiandoPassword = false;
          this.mostrarNotificacion('Contraseña actualizada de forma segura.', 'exito');
        } else {
          this.mostrarNotificacion(respuesta.mensaje || 'La contraseña actual es incorrecta.', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al actualizar contraseña:', err);
        this.mostrarNotificacion('Error de conexión al actualizar contraseña.', 'error');
      }
    });
  }

  // --- NOTIFICACIONES FLOTANTES ---
  mostrarNotificacion(texto: string, tipo: string) {
    this.mensajeAlerta = { texto, tipo };
    setTimeout(() => this.mensajeAlerta = { texto: '', tipo: '' }, 4000);
  }
}