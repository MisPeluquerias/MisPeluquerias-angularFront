import { Router } from '@angular/router';
import { SalonReclamationService } from './../../../core/services/salon-reclamation.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-salon-reclamation',
  templateUrl: './salon-reclamation.component.html',
  styleUrls: ['./salon-reclamation.component.scss'],
})
export class SalonReclamationComponent implements OnInit {
  @ViewChild('reclamationForm') reclamationForm!: NgForm;
  provinces: any[] = [];
  cities: any[] = [];
  isDisabled = false;
  successMessage: string = '';
  errorMessage: string = '';
  province: any = {};
  salonData: any = {};
  userData: any = {};
  id_user: string = '';
  salon_name: string = '';
  id_province: any = '';
  id_city: string = '';
  observation: string = '';
  dnifront_path: string = '';
  dniback_path: string = '';
  invoice_path: string = '';
  file_path: string = '';
  terms: boolean = false;
  dniFrontFile: File | null = null;
  dniBackFile: File | null = null;
  invoiceFile: File | null = null;
  otherFile: File | null = null;
  fileError: string = '';
  salons: any[] = [];
  salon: string = '';
  id_salon: string | null = '';
  salonName: string = '';
  address:string="";
  private searchTermsSalon = new Subject<string>();
  isReadOnly:boolean=false;


  constructor(
    private salonReclamationService: SalonReclamationService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private activateRouter:ActivatedRoute
  ) {}



  ngOnInit(): void {

    this.id_salon = this.activateRouter.snapshot.paramMap.get('id_salon');
    this.loadProvinces();
    if (this.id_salon) {
      this.getSalonById(this.id_salon);
    }

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
    this.searchTermsSalon
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 3) {
            return this.salonReclamationService.searchSalon(term);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (salons) => {
          this.salons = salons;
        },
        error: (error) => {
          console.error('Error al buscar salones:', error);
        },
      });
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

  onInputSalon(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSalon(inputElement.value.trim());
  }

  searchSalon(term: string): void {
    this.searchTermsSalon.next(term);
  }

  onSelectSalon(salon: any): void {
    this.salon_name = salon.name;
    this.salons = [];
    this.cdr.detectChanges(); // Forzar la actualización de la vista
  }

  onProvinceChange(provinceId: number): void {
    this.salonData.id_city = ''; // Resetea el valor de la ciudad cuando cambia la provincia
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
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];

    if (file && allowedTypes.includes(file.type)) {
      if (fileType === 'dniFrontFile') {
        this.dniFrontFile = file;
      } else if (fileType === 'dniBackFile') {
        this.dniBackFile = file;
      } else if (fileType === 'otherFile') {
        this.otherFile = file;
      }else if (fileType === 'invoiceFile') {
        this.invoiceFile = file;
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
  }



  getSalonById(id_salon: any) {
    this.salonReclamationService.getSalonById(id_salon).subscribe(
      (response: any) => {
        // Asegúrate de que response sea un array y accede al primer elemento
        if (Array.isArray(response) && response.length > 0) {
          this.salonData = response[0]; // Accede al primer objeto del array
          console.log('Datos del salón recibidos:', this.salonData);
          this.loadSalonData();
        } else {
          console.log('No se encontró información para este salón');
        }
      },
      (error) => {
        console.log('Error al obtener información del salón', error);
      }
    );
  }

  loadSalonData(): void {
    if (this.salonData) {
      this.salon_name = this.salonData.name;
      this.id_province = this.salonData.id_province;
      this.address = this.salonData.address;

      // Cargar las ciudades basadas en la provincia seleccionada
      this.salonReclamationService.getCitiesByProvince(this.id_province).subscribe(
        (response: any) => {
          this.cities = response.data;

          // Una vez que las ciudades estén cargadas, asignar el id_city
          this.id_city = this.salonData.id_city;

          this.isReadOnly=true;
          this.cdr.detectChanges(); // Actualizar la vista
        },
        (error) => {
          console.error('Error al obtener las ciudades:', error);
        }
      );
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
    formData.append('terms', termsValue.toString());

    if (this.dniFrontFile) {
      formData.append('dni_front', this.dniFrontFile);
    }
    if (this.dniBackFile) {
      formData.append('dni_back', this.dniBackFile);
    }
    if (this.otherFile) {
      formData.append('file_path', this.otherFile);
    }
    if (this.invoiceFile) {  // Agregamos la factura
      formData.append('invoice_path', this.invoiceFile);
    }

    console.log('Datos enviados:', formData);

    this.salonReclamationService.addReclamation(formData).subscribe(
      (response: any) => {
        console.log('Reclamación enviada con éxito', response);
        this.successMessage = 'Reclamación enviada con éxito';
      },
      (error) => {
        console.error('Error enviando la reclamación', error);
        if (error.status === 200 || error.statusText === 'OK') {
          this.successMessage = 'Reclamación enviada con éxito (con advertencia)';
          this.toastr.success('Reclamación enviada con éxito.');
          this.reclamationForm.reset();
          this.router.navigate(['/home']);
        } else {
          this.toastr.error('Error, revise el formulario de envío.');
          this.errorMessage = 'Hubo un error al enviar la reclamación';
        }
      }
    );
  }
}
