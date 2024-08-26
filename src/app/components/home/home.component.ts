import { Component, ElementRef, ViewChild } from '@angular/core';
import { SearchBarService } from '../../core/services/navbar-home.service';
import {debounceTime,distinctUntilChanged,switchMap,map,} from 'rxjs/operators';
import { Subject, of} from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/AuthService.service';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  @ViewChild('searchCategoriesModal') searchCategoriesModal!: ElementRef;
  categories: any[] = [];
  services: any[] = [];
  salons: any[] = [];
  cities: any[] = [];
  private searchTermsCategory = new Subject<string>();
  private searchTermsServiceOrSalon = new Subject<string>();
  private searchTermsCity = new Subject<string>();
  isAuthenticated: boolean = false;
  modalCategory:any;
  category: string = '';
  serviceOrSalon: string = '';
  zone: string = '';
  id_city: string = '';
  salonName:string = '';
  private modalInstance!: Modal;
  selectedCategory: string = '';


  constructor(  private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private searchBarService: SearchBarService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private modalService: NgbModal,
    private unRegisteredSearchBusiness: UnRegisteredSearchBuusinessService
  ){}



  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.searchTermsCity
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 2) {
            return this.searchBarService.searchCity(term);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (cities) => {
          this.cities = cities;
        },
        error: (error) => {
          console.error('Error al buscar ciudades:', error);
        },
      });
  }

  ngAfterViewInit() {
    this.modalInstance = new Modal(this.searchCategoriesModal.nativeElement);
  }

  openModal(category: string) {
    this.selectedCategory = category;
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  searchByCityName(cityName: string): void {
    this.unRegisteredSearchBusinessService.searchByCityName(cityName).subscribe(
      (response: any) => {
        console.log('Resultados de la búsqueda:', response);

        // Verificar que response tiene la propiedad 'salons' y que contiene salones
        if (response && Array.isArray(response.salons) && response.salons.length > 0) {
          console.log('Número total de salones recibidos:', response.salons.length);
          console.log(cityName);

          // Navegar a la página de resultados
          this.router.navigate(['/unregistered-search'], { queryParams: { name: cityName } });
        } else {
          this.toastr.info('No se encontraron salones en esta ciudad.');
        }
      },
      (error) => {
        this.toastr.error('<i class="las la-info-circle"></i> Actualmente, no tenemos salones en esta provincia, estamos trabajando en ello.');
        console.error('Error al buscar por nombre de ciudad:', error);
      }
    );
  }


  onInputCity(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim();

    // Si el campo de ciudad se limpia, también limpiar el id_city
    if (value === '') {
      this.id_city = '';  // Limpiar id_city si se borra el campo
    }

    this.searchCity(value);
  }

  searchCity(term: string): void {
    this.searchTermsCity.next(term);
  }

  onSelectCity(city: any): void {
    this.zone = `${city.name} - ${city.zip_code}`;
    this.id_city = city.id_city;
    this.cities = [];
  }


  onSearch() {
    if (this.id_city !== "") {
      this.unRegisteredSearchBusiness.searchByCityAndCategory(this.id_city, this.selectedCategory).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para la ciudad y categoría seleccionadas.');
          } else {
            // Cerrar el modal usando NgbModal
            this.closeModal();

            // Navegar a la página de resultados con los parámetros de consulta adecuados
            this.router.navigate(['/unregistered-search'], {
              queryParams: { id_city: this.id_city, categoria: this.selectedCategory },
            });
          }
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por ciudad y categoría:', error);
          this.toastr.error('Ocurrió un error al realizar la búsqueda. Por favor, intente nuevamente.');
        },
      });
    } else {
      this.toastr.error('Seleccione una localidad para realizar la búsqueda.');
    }
  }

  slides = [
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 1",
      desc: "Descripción 1"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 2",
      desc: "Descripción 2"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 3",
      desc: "Descripción 3"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 4",
      desc: "Descripción 4"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 5",
      desc: "Descripción 5"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 6",
      desc: "Descripción 6"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 7",
      desc: "Descripción 7"
    },
    {
      img: "../../../assets/img/web/categoria-corte-cabello.webp",
      title: "Título 8",
      desc: "Descripción 8"
    }
  ];

}
