import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfumeAPI, OfertaItem, ConfiguracionReloj } from '../models/oferta/oferta';

@Injectable({
  providedIn: 'root'
})
export class Ofertasadm {
  private http = inject(HttpClient);
  
  // URL base de tu API en C#
  private apiUrl = 'https://back-end-donaruma-production.up.railway.app/api';

  // 1. Obtener los perfumes para el select de administración
  obtenerPerfumesInventario(): Observable<PerfumeAPI[]> {
    return this.http.get<PerfumeAPI[]>(`${this.apiUrl}/Perfumes/todos`);
  }

 guardarConfiguracionReloj(fecha: string): Observable<ConfiguracionReloj> {
  const body: ConfiguracionReloj = { fechaFinOferta: fecha };
  return this.http.post<ConfiguracionReloj>(`${this.apiUrl}/Ofertas/reloj`, body);
}

guardarOferta(idPerfume: number, descuento: number, precioOferta: number): Observable<any> {
  const body = {
    idPerfume: idPerfume,
    descuento: descuento,
    precioOferta: precioOferta // Enviamos el valor calculado en el front
  };
  
  return this.http.post(`${this.apiUrl}/Ofertas/guardar`, body);
}

obtenerOfertasGuardadas(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/Ofertas/listar`);
}

  // Cambiar el estado (Activo/Inactivo) en la base de datos
  cambiarEstadoOferta(idOferta: number, estado: boolean): Observable<any> {  
  // Nota: Usamos headers para asegurarnos de que C# entienda que es un valor primitivo JSON
  const headers = { 'Content-Type': 'application/json' };
  
  return this.http.put(`${this.apiUrl}/Ofertas/estado/${idOferta}`, estado, { headers });
}

// Agrega esto a tu servicio
obtenerRelojCliente(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/Ofertas/reloj`);
}

obtenerOfertasCliente(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/Ofertas/activas`);
}

}