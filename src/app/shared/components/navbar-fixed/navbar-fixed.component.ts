import { Component, OnInit } from '@angular/core';
import { NavBarFixedService } from '../../../core/services/navbar-fixed.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Subject, of, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/AuthService.service'; // Importa el servicio de autenticación

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

  constructor(
    private navBarFixedService: NavBarFixedService,
    private router: Router,
    private authService: AuthService // Inyecta el servicio de autenticación
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
      this.router.navigate(['/login']);
    }
  }
}
