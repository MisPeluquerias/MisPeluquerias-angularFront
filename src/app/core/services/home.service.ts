import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http:HttpClient) { }

  baseUrl: string = environment.baseUrl;

  getSalonValidated(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/home/getSalonValidated`, {
    });
  }
}
