import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from '../register/register.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

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
      this.http.post('http://localhost:3000/login', this.loginForm.value)
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('Token', response.token);
            this.router.navigate(['/business']);
            this.activeModal.close();
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
    event.preventDefault(); // Previene la acción por defecto del enlace
    this.modalService.dismissAll(); // Cierra el modal actual
    this.modalService.open(RegisterComponent); // Abre el modal de registro
  }
}
