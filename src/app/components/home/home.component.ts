import { Component, ElementRef, ViewChild,HostListener } from '@angular/core';
import { SearchBarService } from '../../core/services/navbar-home.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/AuthService.service';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';
import { LoginComponent } from '../../auth/login/login.component';
import { HomeService } from '../../core/services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  @ViewChild('searchCategoriesModal') searchCategoriesModal!: ElementRef;
  categories: any[] = [];
  services: any[] = [];
  service: string = '';
  salons: any[] = [];
  salon: string = "";
  cities: any[] = [];
  private searchTermsService = new Subject<string>();
  private searchTermsSalon = new Subject<string>();
  private searchTermsCity = new Subject<string>();
  private searchTermsCityModal = new Subject<string>();
  isAuthenticated: boolean = false;
  modalCategory: any;
  category: string = '';
  serviceOrSalon: string = '';
  zone: string = '';
  zoneModal: string = ""
  id_city: string = '';
  id_salon: string = '';
  salonName: string = "";
  private modalInstance!: Modal;
  selectedCategory: string = '';
  citiesModal: any[] = [];
  isDropdownOpen: boolean = false;
  @ViewChild('dropdownMenuButton') dropdownMenuButton!: ElementRef;


  constructor(
    private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private searchBarService: SearchBarService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private modalService: NgbModal,
    private homeService: HomeService,
  ) { }


  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.searchTermsCity
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 3) {
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

    this.homeService.getSalonValidated().subscribe({
      next: (salons) => {

        this.slides = salons.map(salon => ({
          img: salon.image,  // Asegúrate de que esta propiedad coincida con tu estructura de datos
          title: salon.name,    // Cambia 'name' por la propiedad correcta en tus datos
          desc: salon.address,
          id:salon.id_salon

        }));
        console.log(this.slides)
      },
      error: (error) => {
        console.error('Error al obtener salones validados:', error);
      }
    });

    this.searchTermsCityModal
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 3) {
            return this.searchBarService.searchCity(term);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (citiesModal) => {
          this.citiesModal = citiesModal;
        },
        error: (error) => {
          console.error('Error al buscar ciudades:', error);
        },
      });

    this.searchTermsService
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 3) {
            return this.searchBarService.searchService(term);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (services) => {
          this.services = services;
        },
        error: (error) => {
          console.error('Error al buscar servicios:', error);
        },
      });

    this.searchTermsSalon
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 3) {
            return this.searchBarService.searchSalon(term);
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

  ngAfterViewInit() {
    this.modalInstance = new Modal(this.searchCategoriesModal.nativeElement);
  }
  public viewDetails(id: any, salonName: string): void {
    console.log('id recibido',id,'salon recibido',salonName);
    if (id && salonName) {
      // Generar el slug del salón a partir del nombre
      const salonSlug = salonName
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');

      console.log('Navigating to details with ID:', id, 'and Slug:', salonSlug);

      // Navegar a la URL con el slug y el ID
      this.router.navigate([`/centro/${salonSlug}/${id}`]);
    } else {
      console.error('Marker ID or salon name is undefined');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Verifica si el clic fue fuera del botón o del menú
    if (this.isDropdownOpen && !this.dropdownMenuButton.nativeElement.contains(targetElement)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }



  openModal(category: string) {
    this.selectedCategory = category;
    this.modalInstance.show();
  }

  openLoginModalToReclamation(): void {
    const modalRef = this.modalService.open(LoginComponent);
    modalRef.componentInstance.redirectUrl = '/reclamation';
  }

  openLoginModal() {
    this.modalService.open(LoginComponent);
  }

  openLoginModalToBusiness(): void {
    const modalRef = this.modalService.open(LoginComponent);
    modalRef.componentInstance.redirectUrl = '/centros';
  }

  closeModal() {
    this.modalInstance.hide();
  }

  searchByCityName(cityName: string): void {
    this.unRegisteredSearchBusinessService.searchByCityName(cityName).subscribe(
      (response: any) => {
        if (response && Array.isArray(response.salons) && response.salons.length > 0) {
          this.router.navigate(['/buscador'], { queryParams: { name: cityName } });
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

    if (value === '') {
      this.id_city = '';
    }

    this.searchCity(value);
  }

  onInputCityModal(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim();

    if (value === '') {
      this.id_city = '';
    }

    this.searchCityModal(value);
  }

  searchCity(term: string): void {
    this.searchTermsCity.next(term);
  }

  searchCityModal(term: string): void {
    this.searchTermsCityModal.next(term);
  }

  onSelectCity(city: any): void {
    this.zone = `${city.name} - ${city.zip_code}`;
    this.id_city = city.id_city;
    this.cities = [];
  }

  onSelectCityModal(city: any): void {
    this.zoneModal = `${city.name} - ${city.zip_code}`;
    this.id_city = city.id_city;
    this.citiesModal = [];
  }

  onSearchModal() {
    if (this.id_city !== "") {
      const searchParams = {
        id_city: this.id_city,
        categoria: this.selectedCategory
      };

      this.unRegisteredSearchBusinessService.searchByCityAndCategory(searchParams.id_city, searchParams.categoria).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para la ciudad y categoría seleccionadas.');
          } else {
            this.closeModal();
            this.router.navigate(['/buscador'], {
              queryParams: searchParams,
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

  onSearch() {
    if (this.id_salon && String(this.id_salon).trim() !== '') {
      if (this.id_city || this.service) {
        this.toastr.error('Para buscar por nombre de salón, solo debe estar seleccionado el campo de nombre.');
        return;
      }

      const salonSlug = this.salonName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

      this.unRegisteredSearchBusinessService.viewDetailsBusiness(this.id_salon).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para el salón especificado.');
          } else {
            this.router.navigate([`/centro/${salonSlug}/${this.id_salon}`]);  // Cambiar a usar '/' en lugar de '-'
          }
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por nombre:', error);
          this.toastr.error('Hubo un error al realizar la búsqueda.');
        },
      });
      return;
    }

    if (this.service && (!this.id_city || String(this.id_city).trim() === '')) {
      this.toastr.error('Por favor seleccione una ciudad para buscar un servicio.');
      return;
    }

    if (this.id_city && this.service) {
      this.unRegisteredSearchBusinessService.searchByService(this.id_city, this.service).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para el servicio en la ciudad seleccionada.');
          } else {
            this.router.navigate(['/buscador'], {
              queryParams: { id_city: this.id_city, service: this.service },
            });
          }
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por servicio y ciudad:', error);
          this.toastr.error('Hubo un error al realizar la búsqueda.');
        },
      });
      return;
    }

    if (this.id_city && !this.service) {
      this.unRegisteredSearchBusinessService.searchByCity(this.id_city).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para la ciudad seleccionada.');
          } else {
            this.router.navigate(['/buscador'], {
              queryParams: { id_city: this.id_city },
            });
          }
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por ciudad:', error);
          this.toastr.error('Hubo un error al realizar la búsqueda.');
        },
      });
      return;
    }

    if (this.id_salon && String(this.id_salon).trim() !== '') {
      if (this.id_city || this.service) {
        this.toastr.error('Para buscar por nombre de salón, solo debe estar seleccionado el campo de nombre.');
        return;
      }

      this.unRegisteredSearchBusinessService.searchByName(this.id_salon).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para el salón especificado.');
          } else {
            this.router.navigate(['/buscador'], {
              queryParams: { salonName: this.id_salon },
            });
          }
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por nombre:', error);
          this.toastr.error('Hubo un error al realizar la búsqueda.');
        },
      });
      return;
    }

    this.toastr.error('Por favor complete al menos un campo para realizar la búsqueda.');
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

  handleAuthAction(): void {
    if (this.isAuthenticated) {
      this.toggleDropdown(); // Abre o cierra el dropdown si el usuario está autenticado
    } else {
      this.openLoginModalToBusiness(); // Abre el modal de login si no está autenticado
    }
  }

  onSelectService(service: string): void {
    this.service = service;
    this.services = [];
  }

  onInputService(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchService(inputElement.value.trim());
  }

  searchService(term: string): void {
    this.searchTermsService.next(term);
  }

  searchSalon(term: string): void {
    this.searchTermsSalon.next(term);
  }

  onInputSalon(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSalon(inputElement.value.trim());
  }

  onSelectSalon(salon: any): void {
    this.salon = salon.id_salon;
    this.id_salon = this.salon;
    this.salonName = salon.name;
    this.salons = [];
  }

  logout() {
    this.authService.logout();
  }

}
