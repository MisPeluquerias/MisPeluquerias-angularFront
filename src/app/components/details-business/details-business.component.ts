import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-details-business',
  templateUrl: './details-business.component.html',
  styleUrls: ['./details-business.component.scss']
})
export class DetailsBusinessComponent implements OnInit, AfterViewInit {
  business: any;
  private map: L.Map | undefined;
  currentDay: string;

  constructor(
    private route: ActivatedRoute,
    private unRegisteredSearchBuusinessService: UnRegisteredSearchBuusinessService
  ) {
    this.currentDay = this.getCurrentDay();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.unRegisteredSearchBuusinessService.viewDetailsBusiness(id).subscribe(
          data => {
            if (data.length > 0) {
              this.business = data[0];
              this.business.hours_old = this.sortHours(this.business.hours_old);
              console.log(data);
              // Mover initMap() aquí para asegurarse de que el mapa se inicializa
              setTimeout(() => {
                this.initMap();
              }, 0);
            } else {
              console.error('No business data found');
            }
          },
          error => console.error('Error loading business details', error)
        );
      }
    });
  }

  ngAfterViewInit(): void {
    // Esperar a que los datos del negocio se carguen antes de inicializar el mapa
    // this.initMap() ya se llama en ngOnInit después de obtener los datos del negocio
  }

  private initMap(): void {
    if (!this.business) return;

    this.map = L.map('map', {
      center: [this.business.latitud, this.business.longitud],
      zoom: 16
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: '../../../assets/img/web/icon-map-finder.png',
      iconSize: [38, 38], // tamaño del icono
      iconAnchor: [19, 38], // punto del icono que corresponde a la posición del marcador
      popupAnchor: [0, -38] // punto desde el cual se abre el popup relativo al icono
    });

    L.marker([this.business.latitud, this.business.longitud], { icon: customIcon }).addTo(this.map)
      .bindPopup(`<b>${this.business.name}</b><br>${this.business.address}`).openPopup();
  }

  private sortHours(hours: string): string {
    const daysOrder = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
    const hoursArray = hours.split("; ").map(hour => {
      const [day, ...times] = hour.split(", ");
      return { day, times: times.join(", ") };
    });

    hoursArray.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

    return hoursArray.map(({ day, times }) => `${day}, ${times}`).join("; ");
  }

  private getCurrentDay(): string {
    const daysOrder = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const currentDayIndex = new Date().getDay();
    return daysOrder[currentDayIndex];
  }
}
