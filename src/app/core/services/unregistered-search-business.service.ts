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

  searchByCity(id_city: string, id_user?: string): Observable<any[]> {
    let params = new HttpParams().set('id_city', id_city);

    // Solo añadir `id_user` si tiene un valor
    if (id_user) {
      params = params.set('id_user', id_user);
    }
    console.log(id_user);

    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByCityById`, { params });
  }



  searchByService(id_city: string, name: string, id_user?: string): Observable<any[]> {
    const params: any = { id_city, name };

    if (id_user) {
      params.id_user = id_user;
    }

    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchSalonByService`, { params });
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

  searchByCityName(name: string, categoria?: string, id_user?: string): Observable<{ totalSalons: number, salons: any[] }> {
    // Crear un objeto con los parámetros de la solicitud
    const params: any = { name };

    // Agregar `categoria` solo si está definido
    if (categoria) {
      params.categoria = categoria;
    }

    // Agregar `id_user` solo si está definido
    if (id_user) {
      params.id_user = id_user;
    }

    return this.http.get<{ totalSalons: number, salons: any[] }>(`${this.baseUrl}/searchUnRegistered/searchByCityName`, {
      params
    }).pipe(
      tap(response => {
        // Aquí puedes realizar cualquier acción con la respuesta, como depuración
        // console.log('Número de salones recibidos del backend:', response.totalSalons);
        // console.log('Array de salones:', response.salons);
      })
    );
  }


  removeFavorite(id_user_favorite: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/searchUnRegistered/delete-favorite/${id_user_favorite}`);
  }


  viewDetailsBusiness(id: string, id_user?: string): Observable<any[]> {
    const params: { [key: string]: string } = { id };
    if (id_user) {
      params['id_user'] = id_user;
    }
    return this.http.get<any[]>(`${this.baseUrl}/details-business/`, {
      params,
    });
  }


  getImagesAdmin(salon_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getImagesAdmin`, {
      params: {
        salon_id
      }
    });
  }

  searchByCityAndCategory(id_city: string, categoria: string,id_user?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('id_city', id_city)
      .set('categoria', categoria);
    if (id_user) {
      params = params.set('id_user', id_user);
    }
    return this.http.get<any[]>(`${this.baseUrl}/searchUnRegistered/searchByCityAndCategory`, { params });
  }
}

