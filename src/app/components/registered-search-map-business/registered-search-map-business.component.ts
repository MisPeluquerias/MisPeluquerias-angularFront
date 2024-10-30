import { Component, OnInit, AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { RegisteredSearchBuusinessService } from '../../core/services/registered-search-business.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { FavoriteSalonService } from '../../core/services/favorite-salon.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registered-search-business',
  templateUrl: './registered-search-map-business.component.html',
  styleUrls: ['./registered-search-map-business.component.scss']
})
export class RegisteredSearchBusinessComponent implements OnInit, AfterViewInit {

  private map: L.Map | undefined;
  private customIcon: L.Icon | undefined;
  public isLoading: boolean = false;
  public isLoadingPosition: boolean = false;
  public isMapLoading: boolean = false;
  private markerLayer: L.LayerGroup | undefined;
  public visibleMarkers: any[] = [];
  public paginatedMarkers: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 9;
  public selectedMarker: any | null = null;
  private markersMap: Map<any, L.Marker> = new Map();
  private leaflet: any;
  private readonly minZoomToLoadMarkers: number = 14;
  private markerToDelete: any;


  constructor(private registeredSearchBusinessService: RegisteredSearchBuusinessService,
    private favoriteSalonService:FavoriteSalonService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toasrt : ToastrService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Configura el ícono personalizado
    this.customIcon = L.icon({
      iconUrl: '../../../assets/img/web/icon-map-finder.png',
      iconSize: [38, 38],
      iconAnchor: [19, 30],
      popupAnchor: [0, -45]
    });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.initMap();
    });
  }

  onImageError(event: any) {
  event.target.src = '../../../assets/img/web/sello.jpg';
}


  private getImagesAdmin(id: string): void {
    //console.log(`Cargando imágenes para el salón con ID: ${id}`);
    this.registeredSearchBusinessService.getImagesAdmin(id).subscribe(
      images => {
        if (images.length > 0) {
          // Busca el marcador correspondiente y asocia sus imágenes
          const marker = this.visibleMarkers.find(m => m.id_salon === id);
          if (marker) {
            marker.images = images.sort((a, b) => b.file_principal - a.file_principal);
            //console.log(`Imágenes asociadas al marcador con ID: ${id}`, marker.images);
          }
        } else {
          //console.log(`No se encontraron imágenes para el marcador con ID: ${id}`);
        }
      },
      error => console.error('Error loading images', error)
    );
  }



  private async initMap(): Promise<void> {
    this.isLoadingPosition = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.initializeMap([lat, lon]);
          this.isLoadingPosition = false;
        },
        () => {
          this.initializeMap([36.8381, -2.4597]);
          this.isLoadingPosition = false;
        }
      );
    } else {
      this.initializeMap([36.8381, -2.4597]);
      this.isLoadingPosition = false;
    }
  }



  private initializeMap(center: [number, number]): void {
     if (this.map) {
      this.map.remove();
    }
    this.map = L.map('registered-map', {
      center,
      zoom: 16,
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

    this.loadMarkers();
    this.enableMapEvents();
  }

  private loadMarkers(): void {
    const id_user = localStorage.getItem('usuarioId');

    if (!this.map || !this.markerLayer) return;

    const currentZoom = this.map.getZoom();
    if (currentZoom < this.minZoomToLoadMarkers) {
      //console.log(`El nivel de zoom es ${currentZoom}, que es inferior al mínimo necesario (${this.minZoomToLoadMarkers}) para cargar markers.`);
      this.markerLayer!.clearLayers();
      this.visibleMarkers = [];
      this.currentPage = 1; // Volver a la primera página
      this.paginateMarkers();
      this.selectedMarker = null; // Deseleccionar marcador
      return;
    }

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

    this.registeredSearchBusinessService.chargeMarkersAndCards(id_user,boundsParams).subscribe((markers: any[]) => {
      console.log('Datos recibidos del servidor:', markers);
      this.markerLayer!.clearLayers();
      this.visibleMarkers = [];
      this.markersMap.clear();

      markers.forEach((marker, index) => {
        if (this.customIcon && marker.latitud && marker.longitud) {
          const markerInstance = L.marker([marker.latitud, marker.longitud], {
            icon: this.customIcon,
          })
            .addTo(this.markerLayer!)
            .bindPopup(() => {
              const imageUrl =
                marker.images && marker.images.length > 0
                  ? marker.images[0].file_url
                  : marker.image;

              // HTML generado dinámicamente para el popup
              return `<div style="display: flex; align-items: center; padding: 0; font-family: Arial, sans-serif;">
                        <img id="marker-image-${index}" src="${imageUrl || '../../../assets/img/web/sello.jpg'}" alt="${marker.name}" style="width: 90px; height: 90px; object-fit: cover; display: block; margin: 0; border: 2px solid #555; margin-right: 10px;" />
                        <div style="flex-grow: 1; min-width: 0;">
                          <div style="font-weight: bold; font-size: 14px; color: #333;">${marker.name}</div>
                          <div style="font-size: 12px; color: #777;">${marker.address}</div>
                          <button class="info-link" id="info-link-${index}" data-id="${marker.id_salon}" data-name="${marker.name}" style="background: gray; border: none; color:white; font-size:14px; border-radius:3px; cursor: pointer;">+info</button>
                        </div>
                      </div>`;
            });

          // Manejador de eventos para cuando se abre el popup
          markerInstance.on('popupopen', () => {
            // Añade manejador onerror para cargar imagen por defecto si falla
            const imageElement = document.getElementById(`marker-image-${index}`) as HTMLImageElement;
            if (imageElement) {
              imageElement.onerror = function () {
                this.src = '../../../assets/img/web/sello.jpg';  // Imagen por defecto
              };
            }

            // Manejador para el botón de "info"
            const infoLink = document.getElementById(`info-link-${index}`);
            if (infoLink) {
              infoLink.addEventListener('click', (event) => {
                event.preventDefault(); // Evita la recarga de la página al hacer clic en el enlace
                const salonId = infoLink.getAttribute('data-id') ?? '';
                const salonName = infoLink.getAttribute('data-name') ?? '';
                this.viewDetails(salonId, salonName);
              });
            }
          });

          // Manejador de eventos para click en el marker
          markerInstance.on('click', () => this.onMarkerClick(marker));
          this.visibleMarkers.push(marker);
          this.markersMap.set(marker, markerInstance);
          this.getImagesAdmin(marker.id_salon);
        }
      });

      this.currentPage = 1; // Volver a la primera página
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
        this.loadMarkers();
        this.selectedMarker = null;
        this.currentPage = 1; // Volver a la primera página
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
        this.cdr.detectChanges();
      }, 500);
    } else {
      this.isLoading = false;
    }

    if (cover) {
      cover.classList.add('fade-out');
      setTimeout(() => {
        this.isMapLoading = false;
        this.applyBlurEffect(false);
        this.cdr.detectChanges();
      }, 500);
    } else {
      this.isMapLoading = false;
      this.applyBlurEffect(false);
      this.cdr.detectChanges();
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
  public viewDetails(id: any, salonName: string): void {
    if (id && salonName) {
        // Generar el slug del salón a partir del nombre
        const salonSlug = salonName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

        console.log('Navigating to details with ID:', id, 'and Slug:', salonSlug);

        // Navegar a la URL con el slug y el ID
        this.router.navigate([`/centro/${salonSlug}/${id}`]);
    } else {
        console.error('Marker ID or salon name is undefined');
    }
}



   addFavorite(marker: any): void {
    const userId = localStorage.getItem('usuarioId');

    if (!userId) {
        console.error('User ID is not available.');
        return; // Termina la ejecución si no hay un ID de usuario disponible
    }

    const favorite = { id_user: userId, id_salon: marker.id_salon };

    console.log('Attempting to add favorite:', favorite); // Depuración

    this.favoriteSalonService.addFavorite(favorite).subscribe(
        (response: any) => {
            console.log('Add favorite response:', response); // Depuración

            if (response && response.id_user_favorite) {
                marker.isFavorite = true;
                marker.id_user_favorite = response.id_user_favorite;
                //console.log('Favorite added successfully');
                this.toasrt.success('El salón se añadio a su lista de favoritos');
                this.loadMarkers();
            } else {
                console.error('Unexpected response format:', response);
                this.toasrt.success('Error,intentelo de nuevo mas tarde');

            }
        },
        error => {
          this.toasrt.success('El salón ya esta en su lista de favoritos');
            console.error('Error adding favorite', error);
        }
    );
}

deleteFavorite(marker: any): void {
  this.markerToDelete = marker;
  const id_user_favorite = this.markerToDelete.id_user_favourite;

      if (!id_user_favorite) {
          console.error('Cannot remove favorite: id_user_favorite is not defined');
          return;
      }

      this.registeredSearchBusinessService.removeFavorite(id_user_favorite).subscribe(
        () => {
          this.markerToDelete.isFavorite = false;
          this.markerToDelete.id_user_favorite = null;
          this.markerToDelete = null;
          this.loadMarkers();
          this.toasrt.success('El salón se elimino de su lista de favoritos');
          //console.log('Favorite removed successfully');
        },
        error => {
          console.error('Error removing favorite', error);
        }
      );
    }

    toggleFavorite(marker: any) {
      if (marker.is_favorite) {
        // Eliminar de favoritos
        this.deleteFavorite(marker);
      } else {
        // Añadir a favoritos
        this.addFavorite(marker);
      }
    }
}
