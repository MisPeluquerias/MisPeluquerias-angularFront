import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DetailsBusinesstService {  // Asegúrate de que el nombre de la clase esté correctamente escrito

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  loadReview(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/loadReview`, {
      params: {
        id
      },
    });
  }
  loadFaq(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/loadReview`, {
      params: {
        id
      },
    });
  }

}
