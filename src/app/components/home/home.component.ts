import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../auth/login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  

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
