import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { NovedadesService, Novedad } from '../../core/services/novedades';

@Component({
  selector: 'app-novedades-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './novedades-detalle.html',
  styleUrl: './novedades-detalle.css',
})
export class NovedadesDetalle implements OnInit {
  novedad: Novedad | null = null;
  cargando: boolean = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private novedadesService = inject(NovedadesService);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.cargarNoticiaCompleta(Number(idParam));
    } else {
      this.volver();
    }
  }

  cargarNoticiaCompleta(id: number) {
    this.novedadesService.obtenerPorId(id).subscribe({
      // 👇 CORREGIDO: Le decimos explícitamente a Angular qué tipo de datos son 👇
      next: (data: Novedad) => {
        this.novedad = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar la noticia', err);
        this.cargando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/novedades']);
  }
}