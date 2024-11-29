import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router, private http: HttpClient) { }

  baseUrl: string = environment.baseUrl;



  getToken(): string | null {
    return localStorage.getItem('Token');
  }

  isAuthenticated(): boolean {
    if (this.isLocalStorageAvailable()) {
      const token = localStorage.getItem('Token');
      return !!token;
    }
    return false;
  }

  getUserType(): Observable<string> {
    const permisoToken = localStorage.getItem('permiso');
    if (permisoToken) {
      return this.http.post<{ permiso: string }>(`${this.baseUrl}/decode-permiso`, { permiso: permisoToken })
        .pipe(
          map(response => response.permiso || 'client')
        );
    } else {
      return new Observable(observer => {
        observer.next('client');
        observer.complete();
      });
    }
  }
  

  private isLocalStorageAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('Token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('permiso');
    this.router.navigate(['/home']);
    window.location.reload();
  }
}
