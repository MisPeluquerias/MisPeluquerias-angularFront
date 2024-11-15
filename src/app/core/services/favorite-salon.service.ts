import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteSalonService {

  baseUrl: string = environment.baseUrl;


  constructor(private http:HttpClient) { }


  addFavorite(data:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/favorites/add`,data);
  }

  removeFavorite(id_user_favorite: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/favorites/delete/${id_user_favorite}`);
  }

  getImagesAdmin(salon_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/favorites/getImagesAdmin`, {
      params: {
        salon_id
      }
    });
  }


  getFavorites(id_user: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/favorites/get`, { params: { id_user } });
  }
}
