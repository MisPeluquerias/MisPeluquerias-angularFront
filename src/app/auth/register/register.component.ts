import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from '../../core/services/register.service';
import { LoginComponent } from '../login/login.component';
import { Subject, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  cities: any[] = [];
  provinces: any[] = [];

  private searchTermsCity = new Subject<string>();
  private searchTermsProvince = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private registerService: RegisterService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      birth_date: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      dni: ['', Validators.required],
      id_province: ['', Validators.required],
      id_city: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {

    this.searchTermsCity.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length >= 3) {
          return this.registerService.chargeCity(term);
        } else {
          return of([]);
        }
      })
    ).subscribe({
      next: (response) => {
        this.cities = response;
      },
      error: (error) => {
        console.error('Error al buscar ciudades:', error);
      }
    });
    this.searchTermsProvince.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length >= 3) {
          return this.registerService.chargeProvince(term);
        } else {
          return of([]);
        }
      })
    ).subscribe({
      next: (response) => {
        this.provinces = response;
      },
      error: (error) => {
        console.error('Error al buscar ciudades:', error);
      }
    });
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

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
    } else {
      console.error('Formulario inválido');
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
    inputElement.value = `${city.name} - ${city.zip_code}`;
    this.cities = [];
  }
  onSelectProvince(province: any): void {
    const inputElement = document.getElementById('provincia') as HTMLInputElement;
    inputElement.value = `${province.name}`;
    this.provinces = [];
  }
}
