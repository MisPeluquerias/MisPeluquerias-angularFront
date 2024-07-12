import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-salon-reclamation',
  templateUrl: './salon-reclamation.component.html',
  styleUrl: './salon-reclamation.component.scss'
})

export class SalonReclamationComponent {
  reclamationForm: FormGroup;
  provinces = [];  // Load your provinces data here
  cities = [];  // Load your cities data here
  isDisabled = false;  // Logic to determine if form fields should be disabled
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder) {
    this.reclamationForm = this.fb.group({
      businessName: ['', Validators.required],
      id_province: ['', Validators.required],
      id_city: ['', Validators.required],
      businessAddress: ['', Validators.required],
      contactName: ['', Validators.required],
      contactLastname: ['', Validators.required],
      contactPhone: ['', [Validators.required, Validators.pattern('[0-9]{9}')]],
      contactMail: ['', Validators.required],
      dni: ['', Validators.required],
      contactMessagge: ['', Validators.required],
      dni_delante: ['', Validators.required],
      dni_detras: ['', Validators.required],
      files: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.reclamationForm.valid) {
      // Submit the form
      this.successMessage = 'Formulario enviado con éxito.';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      this.successMessage = '';
    }
  }

  checkFiles() {

  }
}
