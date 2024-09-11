import { Console } from 'node:console';
import { Component, OnInit } from '@angular/core';
import { SearchBarService } from '../../../core/services/navbar-home.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../../auth/login/login.component';
import { AuthService } from '../../../core/services/AuthService.service';
import { UnRegisteredSearchBuusinessService } from '../../../core/services/unregistered-search-business.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-bar',
  templateUrl: './navbar-home-search.component.html',
  styleUrls: ['./navbar-home-search.component.scss'],
})
export class NavbarHomeSearchComponent implements OnInit {
  categories: any[] = [];
  services: any[] = [];
  salons: any[] = [];
  cities: any[] = [];


  private searchTermsService = new Subject<string>();
  private searchTermsSalon = new Subject<string>();
  private searchTermsCity = new Subject<string>();

  isAuthenticated: boolean = false;
  category: string = '';
  service: string = '';
  salon: string = '';
  zone: string = '';
  id_city: string = '';
  salonName: string = '';

  constructor(
    private searchBarService: SearchBarService,
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService,
    private unRegisteredSearchBusiness: UnRegisteredSearchBuusinessService,
    private toastr:ToastrService
  ) {}


  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

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


  searchService(term: string): void {
    this.searchTermsService.next(term);
  }

  searchSalon(term: string): void {
    this.searchTermsSalon.next(term);
  }

  searchCity(term: string): void {
    this.searchTermsCity.next(term);
  }

  onInputService(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchService(inputElement.value.trim());
  }

  onInputSalon(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSalon(inputElement.value.trim());
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

  onSelectService(service: string): void {
    this.service = service;
    this.services = [];
  }

  onSelectSalon(salon: any): void {
    this.salon = salon.name; // Asigna el nombre del salón al input enlazado con ngModel
    this.salonName = this.salon;
    this.salons = []; // Limpia la lista de resultados
  }

  onSelectCity(city: any): void {
    this.zone = `${city.name} - ${city.zip_code}`;
    this.id_city = city.id_city;
    this.cities = [];
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
    this.modalService.open(LoginComponent);
  }

  onSearch() {


    if (this.salonName && String(this.salonName).trim() !== '') {
      // Verificar que no haya otros campos seleccionados
      if (this.id_city || this.service) {
        this.toastr.error('Para buscar por nombre de salón, solo debe estar seleccionado el campo de nombre.');
        return;
      }

      // Realizar la búsqueda por nombre si es el único campo seleccionado
      this.unRegisteredSearchBusiness.searchByName(this.salonName).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para el salón especificado.');
          } else {
            this.router.navigate(['/unregistered-search'], {
              queryParams: { salonName: this.salonName },
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
            this.router.navigate(['/unregistered-search'], {
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
            this.router.navigate(['/unregistered-search'], {
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
    if (this.salonName && String(this.salonName).trim() !== '') {
      // Verificar que no haya otros campos seleccionados
      if (this.id_city || this.service) {
        this.toastr.error('Para buscar por nombre de salón, solo debe estar seleccionado el campo de nombre.');
        return;
      }

      // Realizar la búsqueda por nombre si es el único campo seleccionado
      this.unRegisteredSearchBusiness.searchByName(this.salonName).subscribe({
        next: (response) => {
          if (response.length === 0) {
            this.toastr.warning('No se encontraron resultados para el salón especificado.');
          } else {
            this.router.navigate(['/unregistered-search'], {
              queryParams: { salonName: this.salonName },
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
}
