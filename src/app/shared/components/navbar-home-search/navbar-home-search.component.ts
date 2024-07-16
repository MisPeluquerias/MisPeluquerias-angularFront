import { Component, OnInit } from '@angular/core';
import { SearchBarService } from '../../../core/services/navbar-home.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Subject, of, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../../auth/login/login.component';
import { AuthService } from '../../../core/services/AuthService.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './navbar-home-search.component.html',
  styleUrls: ['./navbar-home-search.component.scss']
})
export class NavbarHomeSearchComponent implements OnInit {
  categories: any[] = [];
  services: any[] = [];
  salons: any[] = [];
  cities: any[] = [];
  private searchTermsCategory = new Subject<string>();
  private searchTermsServiceOrSalon = new Subject<string>();
  private searchTermsCity = new Subject<string>();
  isAuthenticated: boolean = false;

  constructor(
    private searchBarService: SearchBarService,
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService // Inyecta el servicio de autenticación
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.searchTermsCategory.pipe(
      debounceTime(300), // Espera 300 ms después de cada pulsación de tecla
      distinctUntilChanged(), // Ignora si la siguiente búsqueda es igual a la anterior
      switchMap(term => {
        if (term.length >= 2) {
          return this.searchBarService.searchCategoryInLive(term);
        } else {
          return of([]);
        }
      })
    ).subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (error) => {
        console.error('Error al buscar categorías:', error);
      }
    });

    this.searchTermsServiceOrSalon.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length >= 2) {
          return forkJoin([
            this.searchBarService.searchService(term),
            this.searchBarService.searchSalon(term)
          ]);
        } else {
          return of([[], []]);
        }
      })
    ).subscribe({
      next: ([services, salons]) => {
        this.services = services;
        this.salons = salons;
      },
      error: (error) => {
        console.error('Error al buscar servicios o salones:', error);
      }
    });

    this.searchTermsCity.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length >= 2) {
          return this.searchBarService.searchCity(term);
        } else {
          return of([]);
        }
      })
    ).subscribe({
      next: (response) => {
        this.cities = response;
      },
      error: (error) => {
        console.error('Error al buscar ciudades:', error);
      }
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
    this.cities = [];
  }

  onSelectSalon(salon: string): void {
    const inputElement = document.getElementById('serviceOrSalon') as HTMLInputElement;
    inputElement.value = salon;
    this.services = [];
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
    this.modalService.open(LoginComponent);
  }
}
