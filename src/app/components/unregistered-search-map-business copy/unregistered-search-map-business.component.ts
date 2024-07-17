import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';

@Component({
  selector: 'app-unregistered-search-business',
  templateUrl: './unregistered-search-map-business.component.html',
  styleUrls: ['./unregistered-search-map-business.component.scss']
})
export class UnRegisteredSearchBusinessComponent implements OnInit, AfterViewInit {

  private map: L.Map | undefined;
  private customIcon: L.Icon | undefined;
  public isLoading: boolean = false;
  public isMapLoading: boolean = false;
  private markerLayer: L.LayerGroup | undefined;
  public visibleMarkers: any[] = [];
  public paginatedMarkers: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 6;
  public selectedMarker: any | null = null;
  private markersMap: Map<any, L.Marker> = new Map();
  private leaflet: any;
  private readonly minZoomToLoadMarkers: number = 14;
  private currentIdCity: string | null = null;

  constructor(
    private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        this.leaflet = L;
        this.customIcon = L.icon({
          iconUrl: '../../../assets/img/web/icon-map-finder.png',
          iconSize: [38, 38],
          iconAnchor: [19, 30],
          popupAnchor: [0, -45]
        });
        this.route.queryParams.subscribe(params => {
          const id_city = params['id_city'];
          if (id_city && id_city !== this.currentIdCity) {
            this.currentIdCity = id_city;
            this.initMap(L, id_city);
          }
        });
      });
    }
  }

  private initMap(L: any, id_city: string): void {
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 16,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.loadMarkers(L, id_city);
    this.enableMapEvents();
  }

  private loadMarkers(L: any, id_city: string): void {
    if (!this.map || !this.markerLayer) return;

    this.isLoading = true;

    this.unRegisteredSearchBusinessService.searchCategoryServiceAndZone(id_city).subscribe((markers: any[]) => {
      this.markerLayer!.clearLayers();
      this.visibleMarkers = [];
      this.markersMap.clear();

      if (markers.length > 0) {
        const bounds = L.latLngBounds(
          markers.map(marker => [marker.latitud, marker.longitud])
        );
        this.map?.fitBounds(bounds);
      }

      markers.forEach((marker) => {
        if (this.customIcon) {
          const markerInstance = L.marker([marker.latitud, marker.longitud], { icon: this.customIcon }).addTo(this.markerLayer!)
            .bindPopup(`<div style="text-align: center; padding: 10px; font-family: Arial, sans-serif;">
              <img src="${marker.image}" alt="${marker.name}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #555; margin-bottom: 5px;" />
              <div style="font-weight: bold; font-size: 14px; color: #333;">${marker.name}</div>
              <div style="font-size: 12px; color: #777;">${marker.address}</div>
            </div>`);
          markerInstance.on('click', () => this.onMarkerClick(marker));
          this.visibleMarkers.push(marker);
          this.markersMap.set(marker, markerInstance);
        }
      });
      this.currentPage = 1;
      this.paginateMarkers();
      this.fadeOutLoadingSpinner();
    }, error => {
      console.error('Error loading markers:', error);
      this.fadeOutLoadingSpinner();
    });
  }

  private onMarkerClick(marker: any): void {
    this.disableMapEvents();
    this.selectedMarker = marker;
    this.map?.setView([marker.latitud, marker.longitud], 18);
    this.goToPageWithMarker(marker);
    setTimeout(() => {
      this.enableMapEvents();
    }, 2000);
  }

  private goToPageWithMarker(marker: any): void {
    const markerIndex = this.visibleMarkers.indexOf(marker);
    if (markerIndex !== -1) {
      this.currentPage = Math.floor(markerIndex / this.itemsPerPage) + 1;
      this.paginateMarkers();
    }
  }

  private disableMapEvents(): void {
    if (this.map) {
      this.map.off('moveend');
      this.map.off('click');
    }
  }

  private enableMapEvents(): void {
    if (this.map) {
      this.map.on('moveend', () => {
        const id_city = this.route.snapshot.queryParamMap.get('id_city')!;
        if (id_city && id_city !== this.currentIdCity) {
          this.currentIdCity = id_city;
          this.loadMarkers(this.leaflet, id_city);
          this.selectedMarker = null;
          this.currentPage = 1;
        }
      });

      this.map.on('click', () => {
        this.isMapLoading = true;
        this.applyBlurEffect(true);
        setTimeout(() => {
          const id_city = this.route.snapshot.queryParamMap.get('id_city')!;
          if (id_city && id_city !== this.currentIdCity) {
            this.currentIdCity = id_city;
            this.loadMarkers(this.leaflet, id_city);
          }
        }, 100);
      });
    }
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

  public get totalCards(): number {
    return this.visibleMarkers.length;
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

  public onCardClick(marker: any): void {
    this.disableMapEvents();
    const markerInstance = this.markersMap.get(marker);
    if (markerInstance) {
      this.map?.setView([marker.latitud, marker.longitud], 18);
      this.selectedMarker = marker;
      markerInstance.openPopup();
    }
    setTimeout(() => {
      this.enableMapEvents();
    }, 2000);
  }
}
