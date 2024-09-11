import { Router } from '@angular/router';
import { SalonReclamationService } from './../../../core/services/salon-reclamation.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-salon-reclamation',
  templateUrl: './salon-reclamation.component.html',
  styleUrls: ['./salon-reclamation.component.scss']
})
export class SalonReclamationComponent implements OnInit {
  @ViewChild('reclamationForm') reclamationForm!: NgForm;
  provinces: any[] = []; 
  cities: any[] = []; 
  isDisabled = false;  // Logic to determine if form fields should be disabled
  successMessage: string = '';
  errorMessage: string = '';
  province: any = {};
  salonData: any = {};
  userData: any = {};
  id_user: string = '';
  salon_name: string = '';
  id_province: string = '';
  id_city: string = '';
  observation: string = '';
  dnifront_path: string = '';
  dniback_path: string = '';
  file_path: string = '';
  terms: boolean = false;
  dniFrontFile: File | null = null;
  dniBackFile: File | null = null;
  otherFile: File | null = null;
  fileError: string = '';


  constructor(
    private salonReclamationService: SalonReclamationService,private toastr : ToastrService, private router:Router) {
  }


  ngOnInit(): void {
    this.loadProvinces();
    this.id_user = localStorage.getItem('usuarioId') || '';
    if (this.id_user) {
      this.salonReclamationService.getUserData(this.id_user).subscribe(
        (response: any) => {
          this.userData = response.data; // Accede directamente a los datos relevantes
        },
        (error) => {
          console.error('Error fetching user data:', error);
        }
      );
    }
  }

   loadProvinces(): void {
    this.salonReclamationService.getProvinces().subscribe(
      (response: any) => {
        this.provinces = response.data;
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }




  onProvinceChange(provinceId: number): void {
    this.salonData.id_city = '';  // Resetea el valor de la ciudad cuando cambia la provincia
    this.salonReclamationService.getCitiesByProvince(provinceId).subscribe(
      (response: any) => {
        this.cities = response.data;
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }


  onFileSelected(event: any, fileType: string): void {
    const file: File = event.target.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

    if (file && allowedTypes.includes(file.type)) {
      if (fileType === 'dniFrontFile') {
        this.dniFrontFile = file;
      } else if (fileType === 'dniBackFile') {
        this.dniBackFile = file;
      } else if (fileType === 'otherFile') {
        this.otherFile = file;
      }
    } else {
      this.toastr.error('Solo se permiten archivos PNG, JPG, JPEG o PDF.');
      event.target.value = ''; // Resetea el campo de archivo

      // Resetea la variable correspondiente
      if (fileType === 'dniFrontFile') {
        this.dniFrontFile = null;
      } else if (fileType === 'dniBackFile') {
        this.dniBackFile = null;
      } else if (fileType === 'otherFile') {
        this.otherFile = null;
      }
    }
  }


  addReclamation(): void {
    const termsValue = this.terms ? 1 : 0;

const formData = new FormData();
formData.append('id_user', this.id_user);
formData.append('salon_name', this.salon_name);
formData.append('id_province', this.id_province);
formData.append('id_city', this.id_city);
formData.append('observation', this.observation);
formData.append('terms', termsValue.toString());  // Convertimos el entero a string para agregarlo al FormData

if (this.dniFrontFile) {
  formData.append('dni_front', this.dniFrontFile);
}
if (this.dniBackFile) {
  formData.append('dni_back', this.dniBackFile);
}
if (this.otherFile) {
  formData.append('file_path', this.otherFile);
}

this.salonReclamationService.addReclamation(formData).subscribe(
  (response: any) => {
    console.log('Reclamación enviada con éxito', response);
    this.successMessage = 'Reclamación enviada con éxito';

  },
  (error) => {
    console.error('Error enviando la reclamación', error);

    // Verifica si el error es del tipo que quieres tratar como éxito
    if (error.status === 200 || error.statusText === 'OK') {
      // Si el servidor devolvió 200 OK pero hubo un problema con el parsing del JSON,
      // aún se puede considerar exitoso si esta es la lógica deseada.
      this.successMessage = 'Reclamación enviada con éxito (con advertencia)';
      this.toastr.success('Reclamación enviada con éxito, nos pondremos en contacto con usted lo antes posible');
      this.reclamationForm.reset();
      this.router.navigate(['/home']);

    } else {
      this.toastr.error('Error, revise el formulario de envio');
      this.errorMessage = 'Hubo un error al enviar la reclamación';
    }
  }
);
}
}
