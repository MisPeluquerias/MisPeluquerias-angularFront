import { Component, OnInit,Input} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  baseUrl: string = environment.baseUrl;
  showPassword = false;


  @Input() redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {}

  // Getter para el campo de correo electrónico
  get email() {
    return this.loginForm.get('email');
  }

  // Getter para el campo de contraseña
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.http.post(`${this.baseUrl}/login`, this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.token) {
            localStorage.setItem('Token', response.token);
            localStorage.setItem('usuarioId', response.usuarioId);
            localStorage.setItem('permiso', response.permiso);

            if (this.redirectUrl) {
              this.router.navigate([this.redirectUrl]);  // Redirigir a la ruta especificada
            } else {
              this.router.navigate(['/centros']);
            }
            this.activeModal.close();
          } else {
            console.error('Faltan datos en la respuesta del servidor', response);
            this.errorMessage = 'Error al procesar la respuesta del servidor.';
          }
        },
        error: (error) => {
          console.error('Error en login', error);
          this.errorMessage = error.error.message || 'Error en el login';
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
    }
  }

  openRegisterModal(event: Event) {
    event.preventDefault();
    this.modalService.dismissAll();
    this.modalService.open(RegisterComponent, { size: 'xl' });
  }
}
