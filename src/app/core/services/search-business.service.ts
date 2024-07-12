import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";

@Injectable({
  providedIn: "root",
})

export class SearchBuusinessService {

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient){}

  chargeMarker(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/business/chargeMarker`, {
    });
  }
}
