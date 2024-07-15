import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { SearchBuusinessService } from '../../core/services/search-business.service';

@Component({
  selector: 'app-search-business',
  templateUrl: './search-business.component.html',
  styleUrls: ['./search-business.component.scss']
})
export class SearchBusinessComponent implements OnInit, AfterViewInit {

  private map: L.Map | undefined;
  private customIcon: L.Icon | undefined;
  public isLoading: boolean = false;
  public isMapLoading: boolean = false;
  private markerLayer: L.LayerGroup | undefined;
  public visibleMarkers: any[] = [];
  public paginatedMarkers: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 6; // Número de elementos por página (3 filas de 2 tarjetas)

  constructor(private searchBusinessService: SearchBuusinessService) {
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        this.customIcon = L.icon({
          iconUrl: '../../../assets/img/web/icon-map-finder.png',
          iconSize: [38, 38],
          iconAnchor: [19, 30],
          popupAnchor: [0, -45]
        });
      });
    }
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.initializeMap(L, [lat, lon]);
        },
        () => {
          this.initializeMap(L, [36.8381, -2.4597]);
        }
      );
    } else {
      this.initializeMap(L, [36.8381, -2.4597]);
    }
  }

  private initializeMap(L: any, center: [number, number]): void {
    this.map = L.map('map', {
      center,
      zoom: 16
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    if (this.customIcon) {
      L.marker(center, { icon: this.customIcon }).addTo(this.map)
        .bindPopup('Ubicación actual por su dispositivo')
        .openPopup();
    }

    this.loadMarkers(L);

    if (this.map) {
      this.map.on('moveend', () => {
        this.loadMarkers(L);
      });

      this.map.on('click', () => {
        this.isMapLoading = true;
        this.applyBlurEffect(true);
        setTimeout(() => this.loadMarkers(L), 100);
      });
    }
  }

  private loadMarkers(L: any): void {
    if (!this.map || !this.markerLayer) return;

    this.isLoading = true;

    const bounds = this.map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const boundsParams = {
      northEastLat: ne.lat,
      northEastLng: ne.lng,
      southWestLat: sw.lat,
      southWestLng: sw.lng,
    };

    this.searchBusinessService.chargeMarkers(boundsParams).subscribe((markers: any[]) => {
      console.log('Received markers:', markers); // Añadir log para depuración
      this.markerLayer!.clearLayers();
      this.visibleMarkers = [];

      markers.forEach(marker => {
        if (this.customIcon) {
          const markerInstance = L.marker([marker.latitud, marker.longitud], { icon: this.customIcon }).addTo(this.markerLayer!)
            .bindPopup(marker.name);
          this.visibleMarkers.push(marker);
        }
      });
      this.paginateMarkers();
      this.fadeOutLoadingSpinner();
    }, error => {
      console.error('Error loading markers:', error);
      this.fadeOutLoadingSpinner();
    });
  }

  private fadeOutLoadingSpinner(): void {
    const spinner = document.getElementById('loading-spinner');
    const cover = document.getElementById('map-cover');
    if (spinner) {
      spinner.classList.add('fade-out');
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    } else {
      this.isLoading = false;
    }

    if (cover) {
      cover.classList.add('fade-out');
      setTimeout(() => {
        this.isMapLoading = false;
        this.applyBlurEffect(false);
      }, 500);
    } else {
      this.isMapLoading = false;
      this.applyBlurEffect(false);
    }
  }

  private applyBlurEffect(apply: boolean): void {
    const mapContent = document.getElementById('map');
    if (mapContent) {
      if (apply) {
        mapContent.classList.add('map-blur');
      } else {
        mapContent.classList.remove('map-blur');
      }
    }
  }

  private paginateMarkers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedMarkers = this.visibleMarkers.slice(startIndex, endIndex);
  }

  public goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateMarkers();
    }
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.paginateMarkers();
    }
  }

  public get totalPages(): number[] {
    return Array(Math.ceil(this.visibleMarkers.length / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
  }
}
