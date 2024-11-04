import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UnRegisteredSearchBuusinessService {

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  searchByCity(id_city: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByCityById`, {
      params: {
        id_city
      },
    });;
  }


  searchByService(id_city:string,name:string):Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchSalonByService`, {
      params: {
        id_city,
        name
      },
    });;
  }

  getFilterCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchUnRegistered/getFilterCategories`);
  }


  searchByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByName`, {
      params: {
        name
      },
    });;
  }

  searchByCityName(name: string, categoria?: string): Observable<{ totalSalons: number, salons: any[] }> {
    // Crear un objeto con los parámetros de la solicitud
    const params: any = { name };

    // Agregar `categoria` solo si está definido
    if (categoria) {
      params.categoria = categoria;
    }

    return this.http.get<{ totalSalons: number, salons: any[] }>(`${this.baseUrl}/searchUnRegistered/searchByCityName`, {
      params
    }).pipe(
      tap(response => {
        // Aquí puedes realizar cualquier acción con la respuesta, como depuración
        //console.log('Número de salones recibidos del backend:', response.totalSalons);
        //console.log('Array de salones:', response.salons);
      })
    );
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

  searchByCityAndCategory(id_city: string, categoria: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByCityAndCategory`, {
      params: {
        id_city,
        categoria
      },
    });
  }
}

