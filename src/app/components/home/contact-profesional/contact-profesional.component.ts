import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-contact-profesional',
  templateUrl: './contact-profesional.component.html',
  styleUrl: './contact-profesional.component.scss'
})
export class ContactProfesionalComponent {

  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{9}'), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      msg: ['', [Validators.required, Validators.maxLength(1000)]],
      term_cond: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form Submitted', this.contactForm.value);
      // Aquí puedes manejar la lógica para enviar el formulario, como hacer una petición HTTP
    }
  }
}
