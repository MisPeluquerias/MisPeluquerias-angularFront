import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class CandidaturesService {

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }


  getCandidaturesByIdUser(id_user: string): Observable<any> {
    if (!id_user) {
      throw new Error('id_user is required'); // Manejo básico de errores en caso de ID faltante
    }
    const params = new HttpParams().set('id_user', id_user);
    return this.http.get(`${this.baseUrl}/candidatures/getCandidaturesByIdUser`, { params });
  }

  removeCandidature(id_user_job_subscriptions: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/candidatures/delete/${id_user_job_subscriptions}`);
  }

}
