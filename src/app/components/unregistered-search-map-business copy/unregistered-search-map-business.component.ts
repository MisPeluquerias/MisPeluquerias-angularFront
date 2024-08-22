import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';  // Importa Leaflet directamente

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
  public itemsPerPage: number = 9;
  public selectedMarker: any | null = null;
  private markersMap: Map<any, L.Marker> = new Map();
  private readonly minZoomToLoadMarkers: number = 14;
  private currentIdCity: string | null = null;

  constructor(
    private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.customIcon = L.icon({
      iconUrl: '../../../assets/img/web/icon-map-finder.png',
      iconSize: [38, 38],
      iconAnchor: [19, 30],
      popupAnchor: [0, -45]
    });

    this.route.queryParams.subscribe(params => {
      const id_city = params['id_city'];
      const name = params['name'];

      if (id_city && id_city !== this.currentIdCity) {
        this.currentIdCity = id_city;
        if (this.map) {
          this.loadMarkers(id_city);
        } else {
          this.initMap(id_city);
        }
      } else if (name) {
        if (this.map) {
          this.loadMarkers(undefined, name);
        } else {
          this.initMap(undefined, name);
        }
      }
    });
  }

  private initMap(id_city?: string, name?: string): void {
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 19,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.loadMarkers(id_city, name);
    this.enableMapEvents();
  }


  private loadMarkers(id_city?: string, name?: string): void {
    if (!this.map || !this.markerLayer) return;

    this.isLoading = true;

    let markerObservable;

    if (id_city) {
      markerObservable = this.unRegisteredSearchBusinessService.searchByCity(id_city);
    } else if (name) {
      markerObservable = this.unRegisteredSearchBusinessService.searchByName(name);
    } else {
      console.error('Neither id_city nor name provided for marker loading.');
      this.fadeOutLoadingSpinner();
      return;
    }

    markerObservable.subscribe((markers: any[]) => {
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
        if (this.customIcon && marker.latitud && marker.longitud) {
          const markerInstance = L.marker([marker.latitud, marker.longitud], { icon: this.customIcon }).addTo(this.markerLayer!)
            .bindPopup(() => {
              const imageUrl = marker.images && marker.images.length > 0
                ? marker.images[0].file_url
                : marker.image;

              return `<div style="text-align: center; padding: 10px; font-family: Arial, sans-serif;">
                        <img src="${imageUrl}" alt="${marker.name}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #555; margin-bottom: 5px;" />
                        <div style="font-weight: bold; font-size: 14px; color: #333;">${marker.name}</div>
                        <div style="font-size: 12px; color: #777;">${marker.address}</div>
                      </div>`;
            });
          markerInstance.on('click', () => this.onMarkerClick(marker));
          this.visibleMarkers.push(marker);
          this.markersMap.set(marker, markerInstance);

          this.getImagesAdmin(marker.id_salon);
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

  private getImagesAdmin(id: string): void {
    console.log(`Cargando imágenes para el salón con ID: ${id}`);
    this.unRegisteredSearchBusinessService.getImagesAdmin(id).subscribe(
      images => {
        if (images.length > 0) {
          // Busca el marcador correspondiente y asocia sus imágenes
          const marker = this.visibleMarkers.find(m => m.id_salon === id);
          if (marker) {
            marker.images = images.sort((a, b) => b.file_principal - a.file_principal);
            console.log(`Imágenes asociadas al marcador con ID: ${id}`, marker.images);
          }
        } else {
          console.log(`No se encontraron imágenes para el marcador con ID: ${id}`);
        }
      },
      error => console.error('Error loading images', error)
    );
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
          this.loadMarkers(id_city);
          this.selectedMarker = null;
          this.currentPage = 1;
        }
      });

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        // Registrar el clic en el mapa para depuración
        console.log('Map clicked at', e.latlng);

        // Verificar si el clic fue en un marcador o no
        if (!this.selectedMarker) {
          // Si no se ha seleccionado un marcador, no aplicar desenfoque
          this.applyBlurEffect(false);
        }

        // Desactivar la carga del mapa ya que no es necesario
        this.isMapLoading = false;
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

    if (marker.latitud && marker.longitud) {
      const markerInstance = this.markersMap.get(marker);
      if (markerInstance) {
        this.map?.setView([marker.latitud, marker.longitud], 18);
        this.selectedMarker = marker;
        markerInstance.openPopup();
      }
    } else {
      console.error('Coordenadas no válidas para el marcador:', marker);
    }

    setTimeout(() => {
      this.enableMapEvents();
    }, 2000);
  }

  public viewDetails(id: any): void {
    if (id) {
      console.log('Navigating to details with ID:', id); // Para depuración
      this.router.navigate(['/details-business', id]);
    } else {
      console.error('Marker ID is undefined');
    }
  }
}
