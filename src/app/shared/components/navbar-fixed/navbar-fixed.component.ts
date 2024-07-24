import { Component, OnInit } from '@angular/core';
import { NavBarFixedService } from '../../../core/services/navbar-fixed.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/AuthService.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../../auth/login/login.component';
import { UnRegisteredSearchBuusinessService } from '../../../core/services/unregistered-search-business.service';

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
  private searchTermsCategory = new Subject<string>();
  private searchTermsServiceOrSalon = new Subject<string>();
  private searchTermsCity = new Subject<string>();
  isAuthenticated: boolean = false;
  id_city: string = '';
  salonName:string = '';

  constructor(
    private navBarFixedService: NavBarFixedService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private unRegisteredSearchBusiness: UnRegisteredSearchBuusinessService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.searchTermsCategory.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term.length >= 2 ? this.navBarFixedService.searchCategoryInLive(term) : of([]))
    ).subscribe({
      next: response => this.categories = response,
      error: error => console.error('Error al buscar categorías:', error)
    });

    this.searchTermsServiceOrSalon.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term.length >= 2 ? forkJoin([this.navBarFixedService.searchService(term), this.navBarFixedService.searchSalon(term)]) : of([[], []]))
    ).subscribe({
      next: ([services, salons]) => {
        this.services = services;
        this.salons = salons;
      },
      error: error => console.error('Error al buscar servicios o salones:', error)
    });

    this.searchTermsCity.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term.length >= 2 ? this.navBarFixedService.searchCity(term) : of([]))
    ).subscribe({
      next: response => this.cities = response,
      error: error => console.error('Error al buscar ciudades:', error)
    });
  }

  searchCategory(term: string): void {
    this.searchTermsCategory.next(term);
  }

  searchServiceOrSalon(term: string): void {
    this.searchTermsServiceOrSalon.next(term);
  }

  searchCity(term: string): void {
    this.searchTermsCity.next(term);
  }

  onInputCategory(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchCategory(inputElement.value.trim());
  }

  onInputServiceOrSalon(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchServiceOrSalon(inputElement.value.trim());
  }

  onSelectCategory(category: string): void {
    const inputElement = document.getElementById('category') as HTMLInputElement;
    inputElement.value = category;
    this.categories = [];
  }

  onInputCity(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchCity(inputElement.value.trim());
  }

  onSelectService(service: string): void {
    const inputElement = document.getElementById('serviceOrSalon') as HTMLInputElement;
    inputElement.value = service;
    this.services = [];
    this.salons = [];
  }

  onSelectCity(city: any): void {
    const inputElement = document.getElementById('zone') as HTMLInputElement;
    inputElement.value = `${city.name} - ${city.zip_code}`;
    this.id_city = city.id_city;
    this.cities = [];
  }

  onSelectSalon(salon: string): void {
    const inputElement = document.getElementById(
      'serviceOrSalon'
    ) as HTMLInputElement;
    inputElement.value = salon;
    this.services = [];
    this.salons = [];
    this.salonName = salon;
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
    // Validar que id_city no esté vacío y convertir a cadena de forma segura
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

    // Validar que salonName no esté vacío y convertir a cadena de forma segura
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
