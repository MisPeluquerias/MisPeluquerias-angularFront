import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DetailsBusinesstService {  // Asegúrate de que el nombre de la clase esté correctamente escrito

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}



  getScoreReviews(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getScoreReviews`, {
      params: {
        id
      },
    });
  }

  getObservationReviews(id_salon: string,page: number, limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getObservationReviews`, {
      params: {
        id_salon,
        page,
        limit
      },
    });
  }



  getFaqs(id_salon: string, page: number , limit: number): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getFaqs`, {
      params: {
        id_salon,
        page,
        limit
      },
    });
  }



  getImagesAdmin(salon_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getImagesAdmin`, {
      params: {
        salon_id
      }
    });
  }

  getReviewSalon(salon_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getReviews`, {
      params: {
        salon_id
      }
    });
  }

  getServicesSalon(id_salon:string){
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getServicesSalon`, {
      params:{
      id_salon
    }
  });
}

getDescrptionSalon(id_salon:string){
  return this.http.get<any[]>(`${this.baseUrl}/details-business/getDescriptionSalon`, {
    params:{
    id_salon
  }
});
}

adddReview(id_user: string, id_salon: string, observacion: string, qualification: string,averageQualification: number): Observable<any[]> {
  const body = {
    id_user,
    id_salon,
    observacion,
    qualification,
    averageQualification
  };

    return this.http.post<any[]>(`${this.baseUrl}/details-business/addReview`, body);
  }

  loadQuestions(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/loadQuestions`, {
      params: {
        id
      },
    });
  }


  updateReview(review: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/details-business/updateReview`, review);
  }

  deleteReview(id_review:string){
    const body = {
      id_review
    };
    return this.http.post<any[]>(`${this.baseUrl}/details-business/deleteReview`, body);
  }

  addFaq(data:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/details-business/addFaq`,data);
  }

  updateFaq(id_faq: string, question: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/details-business/updateQuestion`, { id_faq, question });
  }

  getUsuarioId(token: string): Observable<any> {
    // Enviar el token en el cuerpo de la solicitud
    return this.http.post<any>(`${this.baseUrl}/decode-token/`, { token });
  }


  deleteFaq(id_faq: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/details-business/deleteQuestion`, { id_faq });
  }

  getBrandByIdSalon(id_salon: any) {
    const params = new HttpParams().set('id_salon', id_salon.toString());
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getBrandsBySalon`, { params });
  }
}
