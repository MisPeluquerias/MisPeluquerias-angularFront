import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContactProffesionalService {

  baseUrl: string = environment.baseUrl;

  constructor(private http:HttpClient) { }

  addContact(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contact-proffesional/newContactProffesional`, data);
  }

  getCitiesByProvince(id_province: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact-proffesional/getCitiesByProvince`, {
      params: { id_province: id_province.toString() }
    });
  }

  getProvinces(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact-proffesional/getProvinces`);
  }
}
