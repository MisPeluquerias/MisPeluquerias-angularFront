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


  getImages(salon_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/getImages`, {
      params: {
        salon_id
      }
    });
  }



  saveReview(id_user: string, id_salon: string, observacion: string, qualification: string): Observable<any[]> {
    const body = {
      id_user,
      id_salon,
      observacion,
      qualification
    };
    return this.http.post<any[]>(`${this.baseUrl}/details-business/saveReview`, body);
  }


  loadServices(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/details-business/loadServices`, {
      params: {
        id
      },
    });
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
