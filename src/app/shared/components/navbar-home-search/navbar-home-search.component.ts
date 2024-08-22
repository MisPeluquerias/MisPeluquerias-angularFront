import { Component, OnInit } from '@angular/core';
import { SearchBarService } from '../../../core/services/navbar-home.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../../auth/login/login.component';
import { AuthService } from '../../../core/services/AuthService.service';
import { UnRegisteredSearchBuusinessService } from '../../../core/services/unregistered-search-business.service';

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
    private unRegisteredSearchBusiness: UnRegisteredSearchBuusinessService
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
    this.searchCity(inputElement.value.trim());
  }

  onSelectService(service: string): void {
    this.service = service;
    this.services = [];
  }

  onSelectSalon(salon: any): void { // Asignar el nombre del salón al campo de entrada
    this.salonName = salon.name; // Asegúrate de asignar a salonName también
    this.salons = [];
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

 


    if (this.id_city && String(this.id_city).trim() !== '') {
      this.unRegisteredSearchBusiness.searchByCity(this.id_city).subscribe({
        next: (response) => {
          this.router.navigate(['/unregistered-search'], { queryParams: { id_city: this.id_city } });
          console.log('Resultados de la búsqueda por ciudad:', response);
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por ciudad:', error);
        },
      });
    } else {
      console.warn('id_city está vacío, no se ejecuta la búsqueda por ciudad.');
    }
    if (this.salonName && String(this.salonName).trim() !== '') {
      this.unRegisteredSearchBusiness.searchByName(this.salonName).subscribe({
        next: (response) => {
          this.router.navigate(['/unregistered-search'], { queryParams: { name: this.salonName } });
          console.log('Resultados de la búsqueda por nombre:', response);
        },
        error: (error) => {
          console.error('Error al realizar la búsqueda por nombre:', error);
        },
      });
    } else {
      console.warn('salonName está vacío, no se ejecuta la búsqueda por nombre.');
    }
  }
}
