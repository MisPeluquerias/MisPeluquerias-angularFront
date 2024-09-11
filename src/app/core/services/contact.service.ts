import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ContactService {  // Asegúrate de que el nombre de la clase esté correctamente escrito

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  addContact(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contact/newContact`, data);
  }
}
