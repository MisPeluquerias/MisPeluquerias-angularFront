import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalonReclamationService {
  baseUrl: string = environment.baseUrl;

  constructor(private http:HttpClient) { }

  getProvinces(): Observable<any> {
    return this.http.get(`${this.baseUrl}/salon-reclamation/getProvinces`);
  }

  getCitiesByProvince(id_province: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/salon-reclamation/getCitiesByProvince`, {
      params: { id_province: id_province.toString() }
    });
  }

  getUserData(id_user: string): Observable<any> {

    return this.http.get(`${this.baseUrl}/salon-reclamation/getUserData`, {
      params: { id_user }
    });
  }

  addReclamation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/salon-reclamation/newReclamation`, data);
  }

  searchSalon(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salon-reclamation/searchSalon`, {
      params: {
        name
      },
    });
  }
  getSalonById(id_salon:any):Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/salon-reclamation/getSalonById`, {
      params: {
        id_salon
      },
    });
  }
}
