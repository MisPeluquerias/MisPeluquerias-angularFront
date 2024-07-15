import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";



@Injectable({
  providedIn: "root",
})

export class RegisterService {


  baseUrl: string = environment.baseUrl;


  constructor(private http: HttpClient){}

  chargeCity(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/register/searchCity`, {
      params: {
        name
      },
    });
  }

  chargeProvince(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/register/searchProvince`, {
      params: {
        name
      },
    });
  }


  registerUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, data);
  }
}
