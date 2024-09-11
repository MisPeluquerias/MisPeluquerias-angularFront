import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder,private contactService:ContactService,private toastr:ToastrService) {
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
      this.contactService.addContact(this.contactForm.value).subscribe(
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
