import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class RegisteredSearchBuusinessService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  chargeMarkersAndCards(id_user: any, bounds: any): Observable<any[]> {
    const params = new HttpParams()
        .set('northEastLat', bounds.northEastLat)
        .set('northEastLng', bounds.northEastLng)
        .set('southWestLat', bounds.southWestLat)
        .set('southWestLng', bounds.southWestLng)
        .set('id_user', id_user);

    return this.http.get<any[]>(`${this.baseUrl}/business/chargeMarkersAndCard`, { params });
}

  viewDetailsBusiness(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/`, {
      params: {
        id
      },
    });;
  }

  getImagesAdmin(salon_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getImagesAdmin`, {
      params: {
        salon_id
      }
    });
  }
  removeFavorite(id_user_favorite: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/business/delete-favorite/${id_user_favorite}`);
  }
}
