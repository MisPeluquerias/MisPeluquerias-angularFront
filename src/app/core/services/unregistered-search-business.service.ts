import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UnRegisteredSearchBuusinessService {

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  searchByCity(id_city: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByCityById`, {
      params: {
        id_city
      },
    });;
  }

  searchByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByName`, {
      params: {
        name
      },
    });;
  }
  
  searchByCityName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByCityName`, {
      params: {
        name
      },
    });;
  }


  viewDetailsBusiness(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/`, {
      params: {
        id
      },
    });;
  }
}

