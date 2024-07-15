import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SearchBuusinessService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  chargeMarkers(bounds: any): Observable<any[]> {
    const params = new HttpParams()
      .set('northEastLat', bounds.northEastLat)
      .set('northEastLng', bounds.northEastLng)
      .set('southWestLat', bounds.southWestLat)
      .set('southWestLng', bounds.southWestLng);
    return this.http.get<any[]>(`${this.baseUrl}/business/chargeMarker`, { params });
  }
}
