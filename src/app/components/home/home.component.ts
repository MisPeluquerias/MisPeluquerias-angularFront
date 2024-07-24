import { Component } from '@angular/core';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  constructor(  private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private router: Router,
    private toastr: ToastrService,
  ){}

  searchByCityName(cityName: string): void {

    this.unRegisteredSearchBusinessService.searchByCityName(cityName).subscribe(
      (response) => {
        console.log('Resultados de la búsqueda:', response);
        this.router.navigate(['/unregistered-search'], { queryParams: { name: cityName } });
      },
      (error) => {
        this.toastr.error('Actualmente, no tenemos salones en esta provincia, estamos trabajando en ello.');
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


}
