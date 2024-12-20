import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from '../../core/services/register.service';
import { LoginComponent } from '../login/login.component';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  cities: any[] = [];
  provinces: any[] = [];
  errorMessage : string = "";
  successMessage : string = "";

  private searchTermsCity = new Subject<string>();
  private searchTermsProvince = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private registerService: RegisterService,
    private toastr: ToastrService,
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      birth_date: [''],
      phone: ['', Validators.pattern(/^\d{9}$/)],
      email: ['', [Validators.required, Validators.email]],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{8}[A-Za-z]$/), // Expresión regular para un DNI español
        ],
      ],
      address: ['', Validators.required],
      id_province: ['', Validators.required],
      id_city: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProvinces();
  }

  
  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');
    if (passwordControl && confirmPasswordControl) {
      return passwordControl.value === confirmPasswordControl.value ? null : { 'mismatch': true };
    }
    return null;
  }

  openLoginModal(event: Event) {
    event.preventDefault();
    this.modalService.dismissAll();
    this.modalService.open(LoginComponent);
  }

  returnLoginModal() {
    this.modalService.dismissAll();
    this.modalService.open(LoginComponent);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      this.registerService.registerUser(formData).subscribe(
        response => {
          console.log('Usuario registrado:', response);
          this.registerForm.reset();
          this.successMessage = '¡Se ha registrado con éxito!';
          this.errorMessage = '';
          this.returnLoginModal();
          this.toastr.success('¡Se ha registrado con éxito!');
          // Manejar la respuesta del registro, por ejemplo:
          // mostrar un mensaje de éxito, redirigir al usuario, etc.
        },
        error => {
          console.error('Error al registrar usuario:', error);
          this.errorMessage = error.error.message || 'Error al registrar usuario';
          // Manejar el error, por ejemplo:
          // mostrar un mensaje de error al usuario
        }
      );
    } else {
      console.error('Formulario inválido');
      // Puedes agregar lógica para mostrar errores de validación al usuario
    }
  }

  searchCity(term: string): void {
    this.searchTermsCity.next(term);
  }

  searchProvince(term: string): void {
    this.searchTermsProvince.next(term);
  }

  onInputCity(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchCity(inputElement.value.trim());
  }

  onInputProvince(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchProvince(inputElement.value.trim());
  }

  onSelectCity(city: any): void {
    const inputElement = document.getElementById('ciudad') as HTMLInputElement;
    inputElement.value = `${city.name} - ${city.zip_code} - ${city.id_city}`;
    this.registerForm.patchValue({ id_city: city.id_city });
    this.cities = [];
  }

  onSelectProvince(province: any): void {
    const inputElement = document.getElementById('provincia') as HTMLInputElement;
    inputElement.value = `${province.name} - ${province.id_province}`;
    this.registerForm.patchValue({ id_province: province.id_province });
    this.provinces = [];
  }

  loadProvinces(): void {
    this.registerService.getProvinces().subscribe(
      (response: any) => {
        this.provinces = response.data;
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }


  onProvinceChange(provinceId: number): void {
    ;  // Resetea el valor de la ciudad cuando cambia la provincia
    this.registerService.getCitiesByProvince(provinceId).subscribe(
      (response: any) => {
        this.cities = response.data;
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }
}
