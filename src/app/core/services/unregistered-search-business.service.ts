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

  searchCategoryServiceAndZone(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/`, {
      params: {
        name
      },
    });;
  }
}

