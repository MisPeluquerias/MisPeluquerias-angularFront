import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";

@Injectable({
  providedIn: "root",
})

export class SearchBarService {

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient){}



  searchCategoryInLive(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchBar/searchCategory`, {
      params: {
        name
      },
    });
  }
  searchService(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchBar/searchService`, {
      params: {
        name
      },
    });
  }
  searchSalon(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchBar/searchSalon`, {
      params: {
        name
      },
    });
  }
  

  searchCity(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchBar/searchCity`, {
      params: {
        name
      },
    });
  }
}
