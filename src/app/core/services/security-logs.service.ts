import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SecurityLogsService {
  
  private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/SecurityLogs'; 

  constructor(private http: HttpClient) { }

  obtenerLogs(buscar: string = '', limite: number = 200) {
    let params = new HttpParams().set('limite', limite.toString());
    
    if (buscar) {
      params = params.set('buscar', buscar);
    }

    return this.http.get(this.apiUrl, { params });
  }
}