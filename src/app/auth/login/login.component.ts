import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from '../register/register.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  baseUrl: string = environment.baseUrl;

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal,
    private modalService: NgbModal, private http: HttpClient, private router: Router) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      redirect: ['/']
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.http.post(`${this.baseUrl}/login`, this.loginForm.value)
        .subscribe({
          next: (response: any) => {
            console.log('Respuesta recibida del servidor:', response); // Log para depuración

            if (response.token && response.userId && response.permiso) {
              localStorage.setItem('Token', response.token);
              localStorage.setItem('userId', response.userId);
              localStorage.setItem('permiso', response.permiso);

              console.log('Datos almacenados en local storage: Token, userId, permiso'); // Log para verificar almacenamiento

              this.router.navigate(['/business']);
              this.activeModal.close();
            } else {
              console.error('Faltan datos en la respuesta del servidor', response);
            }
          },
          error: (error) => {
            console.error('Error en login', error);
            this.errorMessage = error.error.message || 'Error en el login';
          }
        });
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
    }
  }

  showRegister(): void {
    console.log('Show register');
  }

  forgotPassword(): void {
    console.log('Forgot password');
  }

  openRegisterModal(event: Event) {
    event.preventDefault();
    this.modalService.dismissAll();
    this.modalService.open(RegisterComponent);
  }
}
