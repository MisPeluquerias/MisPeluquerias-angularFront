import { Component, OnInit, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/AuthService.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../../auth/login/login.component';
import { UnRegisteredSearchBuusinessService } from '../../../core/services/unregistered-search-business.service';
import { ToastrService } from 'ngx-toastr';
import { SearchBarService } from '../../../core/services/navbar-home.service';


@Component({
  selector: 'app-navbar-fixed',
  templateUrl: './navbar-fixed.component.html',
  styleUrls: ['./navbar-fixed.component.scss'],
})
export class NavbarFixedComponent implements OnInit {
  categories: any[] = [];
  services: any[] = [];
  salons: any[] = [];
  cities: any[] = [];
  zone: string = '';
  salon:string = "";
  id_salon:string="";
  private searchTermsService = new Subject<string>();
  private searchTermsSalon = new Subject<string>();
  private searchTermsCategory = new Subject<string>();
  private searchTermsCity = new Subject<string>();
  isAuthenticated: boolean = false;
  id_city: string = '';
  salonName:string = '';
  service: string = '';
  navbarOpen: boolean = false;
  isDropdownOpen: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private unRegisteredSearchBusiness: UnRegisteredSearchBuusinessService,
    private toastr:ToastrService,
    private searchBarService: SearchBarService,
    private elementRef: ElementRef
  ) {}


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


    this.searchTermsService
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length >= 2) {
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
        if (term.length >= 2) {
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  onInputService(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchService(inputElement.value.trim());
  }

  searchService(term: string): void {
    this.searchTermsService.next(term);
  }

  onInputSalon(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSalon(inputElement.value.trim());
  }

  searchSalon(term: string): void {
    this.searchTermsSalon.next(term);
  }

  onSelectService(service: string): void {
    this.service = service;
    this.services = [];
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

  searchCategory(term: string): void {
    this.searchTermsCategory.next(term);
  }

  onSelectCity(city: any): void {
    this.zone = `${city.name} - ${city.zip_code}`;
    this.id_city = city.id_city;
    this.cities = [];

  }


  onSelectSalon(salon: any): void {
    this.salon = salon.id_salon;
    this.id_salon= this.salon;
    this.salonName=salon.name;
    this.salons = [];
  }



  handleAuthAction(): void {
    if (this.isAuthenticated) {
      this.authService.logout();
      this.isAuthenticated = false;
      this.router.navigate(['/home']);
    } else {
      this.openLoginModal();
    }
  }

  openLoginModal() {
    this.modalService.open(LoginComponent,{centered:true});
  }


  onSearch() {
    if (this.id_salon && String(this.id_salon).trim() !== '') {
      // Verificar que no haya otros campos seleccionados
      if (this.id_city || this.service) {
        this.toastr.error('Para buscar por nombre de salón, solo debe estar seleccionado el campo de nombre.');
        return;
      }

      const salonSlug = this.salonName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

      this.unRegisteredSearchBusiness.viewDetailsBusiness(this.id_salon).subscribe({
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

    // Verificar si se seleccionó un servicio sin una ciudad
    if (this.service && (!this.id_city || String(this.id_city).trim() === '')) {
      this.toastr.error('Por favor seleccione una ciudad para buscar un servicio.');
      return;
    }

    // Si hay una ciudad y un servicio, realizar la búsqueda combinada
    if (this.id_city && this.service) {
      this.unRegisteredSearchBusiness.searchByService(this.id_city, this.service).subscribe({
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
      return; // Salir después de realizar la búsqueda combinada
    }

    // Si hay una ciudad pero no un servicio, buscar por ciudad
    if (this.id_city && !this.service) {
      this.unRegisteredSearchBusiness.searchByCity(this.id_city).subscribe({
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
      return; // Salir después de realizar la búsqueda por ciudad
    }

    // Si hay un nombre, buscar por nombre
    if (this.id_salon && String(this.id_salon).trim() !== '') {
      // Verificar que no haya otros campos seleccionados
      if (this.id_city || this.service) {
        this.toastr.error('Para buscar por nombre de salón, solo debe estar seleccionado el campo de nombre.');
        return;
      }

      // Realizar la búsqueda por nombre si es el único campo seleccionado
      this.unRegisteredSearchBusiness.searchByName(this.id_salon).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para el salón especificado.');
          } else {
            this.router.navigate(['/buscador'], {
              queryParams: { salonName: this.id_salon},
            });
          }
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por nombre:', error);
          this.toastr.error('Hubo un error al realizar la búsqueda.');
        },
      });
      return; // Salir después de realizar la búsqueda por nombre
    }

    // Si ningún criterio es válido, mostrar un mensaje de error
    this.toastr.error('Por favor complete al menos un campo para realizar la búsqueda.');
  }


  toggleNavbar(): void {
    this.navbarOpen = !this.navbarOpen;
  }

  logout() {
    this.authService.logout();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngOnDestroy(): void {
    // Elimina el EventListener cuando el componente se destruye para evitar fugas de memoria.
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
}
