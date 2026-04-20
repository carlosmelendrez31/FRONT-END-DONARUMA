import { Component, OnInit } from '@angular/core';
import { SecurityLogsService } from '../../../core/services/security-logs.service'; // Ajusta la ruta

@Component({
  selector: 'app-logs',
  templateUrl: './logs.html',
  styleUrls: ['./logs.css']
})
export class LogsComponent implements OnInit {
  listaLogs: any[] = [];
  cargando: boolean = true;

  constructor(private logsService: SecurityLogsService) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando = true;
    this.logsService.obtenerLogs().subscribe({
      next: (datos) => {
        this.listaLogs = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los logs de seguridad:', err);
        this.cargando = false;
      }
    });
  }
}