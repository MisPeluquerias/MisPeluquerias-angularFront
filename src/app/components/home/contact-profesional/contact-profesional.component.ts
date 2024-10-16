import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContactProffesionalService } from '../../../core/services/contact-proffesional.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-contact-profesional',
  templateUrl: './contact-profesional.component.html',
  styleUrl: './contact-profesional.component.scss'
})
export class ContactProfesionalComponent {

  contactForm: FormGroup;
  id_province: string = '';
  id_city: string = '';
  cities: any[] = [];
  provinces: any[] = [];
  salonData: any = {}

  constructor(private fb: FormBuilder,private contactProffesionalService:ContactProffesionalService,private toastr : ToastrService,private router:Router) {

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{9}'), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      msg: ['', [Validators.required, Validators.maxLength(1000)]],
      salon_name: [''],
      id_province: [''],
      id_city: [''],
      address: [''],
      term_cond: [false, Validators.requiredTrue]
    });
  }


  ngOnInit(): void {
    this.loadProvinces();

  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.contactProffesionalService.addContact(this.contactForm.value).subscribe(
        response => {
          this.toastr.success('Su mensaje fue enviado con éxito, nos pondremos en contacto con usted lo antes posible')
          //console.log('Contacto enviado exitosamente', response);
          this.contactForm.reset();
          this.router.navigate(['/home']);
        },
        error => {
          this.toastr.error('No pudimos enviar su mensaje, estamos trabajando en ello')
          console.error('Error al enviar el contacto', error);
        }
      );
    }
    console.log('Datos enviados:',this.contactForm.value);
  }

  loadProvinces(): void {
    this.contactProffesionalService.getProvinces().subscribe(
      (response: any) => {
        this.provinces = response.data;
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }



  onProvinceChange(provinceId: number): void {
    this.salonData.id_city = ''; // Resetea el valor de la ciudad cuando cambia la provincia
    this.contactProffesionalService.getCitiesByProvince(provinceId).subscribe(
      (response: any) => {
        this.cities = response.data;
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }
}
