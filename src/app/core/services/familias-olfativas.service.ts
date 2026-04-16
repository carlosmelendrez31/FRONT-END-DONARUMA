import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfumeOlfativo } from '../models/familia-olfativa/familia-olfativa';

@Injectable({
  providedIn: 'root',
})

export class FamiliasOlfativas {
  private http = inject(HttpClient);
  
  //La URL de tu API en .NET que me pasaste
private apiUrl = 'https://back-end-donaruma-production-ac0c.up.railway.app/api/Perfumes/todos';

  obtenerPerfumes(): Observable<any[]> {
    return this.http.get<PerfumeOlfativo[]>(this.apiUrl);  }
}