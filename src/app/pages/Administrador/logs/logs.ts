import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 1. IMPORTANTE: Necesario para el buscador
import { SecurityLogsService } from '../../../core/services/security-logs.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 2. Lo inyectamos aquí
  templateUrl: './logs.html',
  styleUrls: ['./logs.css']
})
export class LogsComponent implements OnInit {
  listaLogs: any[] = [];
  cargando: boolean = true;

  // 👇 3. Variables del buscador
  terminoBusqueda: string = '';
  limiteActual: number = 200;

  constructor(private logsService: SecurityLogsService) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando = true;
    // 👇 4. Le pasamos las variables al servicio
    this.logsService.obtenerLogs(this.terminoBusqueda, this.limiteActual).subscribe({
      next: (datos: any) => {
        this.listaLogs = datos;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar logs:', err);
        this.cargando = false;
      }
    });
  }
}