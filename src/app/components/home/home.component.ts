import { Component, } from '@angular/core';
import { SearchBarService } from '../../core/services/navbar-home.service';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
} from 'rxjs/operators';
import { Subject, of, forkJoin, zip } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../auth/login/login.component';
import { AuthService } from '../../core/services/AuthService.service';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  categories: any[] = [];
  services: any[] = [];
  salons: any[] = [];
  cities: any[] = [];
  private searchTermsCategory = new Subject<string>();
  private searchTermsServiceOrSalon = new Subject<string>();
  private searchTermsCity = new Subject<string>();
  isAuthenticated: boolean = false;

  category: string = '';
  serviceOrSalon: string = '';
  zone: string = '';
  id_city: string = '';
  salonName:string = '';

  constructor(  private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private searchBarService: SearchBarService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private modalService: NgbModal,
    private unRegisteredSearchBusiness: UnRegisteredSearchBuusinessService
  ){}

  searchByCityName(cityName: string): void {
    this.unRegisteredSearchBusinessService.searchByCityName(cityName).subscribe(
      (response) => {
        console.log('Resultados de la búsqueda:', response);
        this.router.navigate(['/unregistered-search'], { queryParams: { name: cityName } });
      },
      (error) => {
        this.toastr.error('<i class="las la-info-circle"></i> Actualmente, no tenemos salones en esta provincia, estamos trabajando en ello.');
        console.error('Error al buscar por nombre de ciudad:', error);
      }
    );
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

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }
}
