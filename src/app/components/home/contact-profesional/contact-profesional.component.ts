import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContactProffesionalService } from '../../../core/services/contact-proffesional.service';


@Component({
  selector: 'app-contact-profesional',
  templateUrl: './contact-profesional.component.html',
  styleUrl: './contact-profesional.component.scss'
})
export class ContactProfesionalComponent {

  contactForm: FormGroup;

  constructor(private fb: FormBuilder,private contactProffesionalService:ContactProffesionalService,private toastr : ToastrService) {
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
      this.contactProffesionalService.addContact(this.contactForm.value).subscribe(
        response => {
          this.toastr.success('Su mensaje fue enviado con éxito, nos pondremos en contacto con usted lo antes posible')
          //console.log('Contacto enviado exitosamente', response);
          this.contactForm.reset();
        },
        error => {
          this.toastr.error('No pudimos enviar su mensaje, estamos trabajando en ello')
          console.error('Error al enviar el contacto', error);
        }
      );
    }
  }
}
