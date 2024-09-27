import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DetailsBusinesstService {  // Asegúrate de que el nombre de la clase esté correctamente escrito

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}



  loadReview(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/loadReview`, {
      params: {
        id
      },
    });
  }

  loadFaq(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/loadFaq`, {
      params: {
        id
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

adddReview(id_user: string, id_salon: string, observacion: string, qualification: string): Observable<any[]> {
  const body = {
    id_user,
    id_salon,
    observacion,
    qualification
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

  saveFaq(id_user:string,id_salon: string, question: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/details-business/saveFaq`, {id_user,id_salon, question });
  }

  updateFaq(id_faq: string, answer: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/details-business/updateQuestion`, { id_faq, answer });
  }

  deleteFaq(id_faq: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/details-business/deleteQuestion`, { id_faq });
  }

}
