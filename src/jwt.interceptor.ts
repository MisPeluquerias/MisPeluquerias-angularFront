import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './app/core/services/AuthService.service'; // Asegúrate de importar tu servicio de autenticación

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = localStorage.getItem('Token'); // Suponiendo que tengas un método para obtener el token

    let authReq = req;
    if (authToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/login')) {
          console.log('Error 401 detectado, cerrando sesión');
          this.router.navigate(['/home']);
          this.authService.logout(); // Llamamos al método de logout de AuthService
           // Redirigir al usuario a la página de inicio
        }
        return throwError(error); // Reemitir el error
      })
    );
  }
}
