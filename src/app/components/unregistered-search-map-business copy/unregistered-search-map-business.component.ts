import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import * as L from 'leaflet'; // Importa Leaflet directamente
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FavoriteSalonService } from '../../core/services/favorite-salon.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/AuthService.service';
import { LoginComponent } from '../../auth/login/login.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-unregistered-search-business',
  templateUrl: './unregistered-search-map-business.component.html',
  styleUrls: ['./unregistered-search-map-business.component.scss'],
})
export class UnRegisteredSearchBusinessComponent
  implements OnInit, AfterViewInit
{
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
  private currentService: string | null = null;
  cityName: string | null = null;
  isAuthenticated: boolean = false;
  getFilterForCategories: any[] = [];
  horarioFilter: string = '';
  categoriaFilter: string = '';
  allMarkers: any[] = []; // Todos los marcadores
  filteredMarkers: any[] = [];
  is_open: string = '';

  constructor(
    private unRegisteredSearchBusinessService: UnRegisteredSearchBuusinessService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private favoriteSalonService: FavoriteSalonService,
    private toasrt: ToastrService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.cityName = params.get('name');
    });

    this.isAuthenticated = this.authService.isAuthenticated();
    this.getFilterCategories();
  }

  ngAfterViewInit(): void {
    this.customIcon = L.icon({
      iconUrl: '../../../assets/img/web/icon-map-finder.png',
      iconSize: [38, 38],
      iconAnchor: [19, 30],
      popupAnchor: [0, -45],
    });

    this.route.queryParams.subscribe((params) => {
      const id_city = params['id_city'];
      const name = params['name'];
      const salonName = params['salonName'];
      const categoria = params['categoria'];
      const service = params['service'];

      if (this.currentIdCity !== id_city || this.currentService !== service) {
        this.currentIdCity = id_city;
        this.currentService = service;
        this.updateMap({ id_city, name, salonName, categoria, service });
      } else {
        // Fuerza la recarga de marcadores si la ciudad es la misma
        this.updateMap({ id_city, name, salonName, categoria, service }, true);
      }
    });

    this.cdr.detectChanges();
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 2000);
  }
  private updateMap(
    params: {
      id_city?: string;
      name?: string;
      salonName?: string;
      categoria?: string;
      service?: string;
    },
    forceReload: boolean = false
  ): void {
    if (this.map) {
      if (forceReload) {
        // Borrar los marcadores actuales y recargar
        this.markerLayer?.clearLayers();
      }
      this.loadMarkers(params);
    } else {
      this.initMap(params);
    }
  }

  getFilterCategories() {
    this.unRegisteredSearchBusinessService.getFilterCategories().subscribe(
      (categories) => {
        this.getFilterForCategories = categories;
        //console.log('Filtros para categorías:', this.getFilterForCategories);
      },
      (error) => {
        console.error(
          'Error al obtener las categorías para los filtros:',
          error
        );
      }
    );
  }

  openDropdown(event: Event) {
    event.stopPropagation(); // Evita que el clic se propague al documento
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu) {
      // Alterna el estado del menú
      const isCurrentlyOpen = dropdownMenu.classList.contains('show');

      // Si está abierto, ciérralo
      if (isCurrentlyOpen) {
        dropdownMenu.classList.remove('show');
      } else {
        // Si está cerrado, ábrelo y agrega el listener para cerrar al hacer clic fuera
        dropdownMenu.classList.add('show');

        // Agregar un listener temporal para cerrar el dropdown al hacer clic fuera
        document.addEventListener(
          'click',
          (outsideEvent) => {
            if (!dropdownMenu.contains(outsideEvent.target as Node)) {
              dropdownMenu.classList.remove('show');
            }
          },
          { once: true }
        ); // `{ once: true }` asegura que el listener se elimine después de ejecutarse
      }
    }
  }

  private initMap(params: {
    id_city?: string;
    name?: string;
    salonName?: string;
    categoria?: string;
    service?: string;
  }): void {
    this.map = L.map('unregistered-map', {
      center: [0, 0],
      zoom: 19,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.loadMarkers(params);
    this.enableMapEvents();
  }

  applyFilters(): void {
    this.loadMarkers({
      id_city: this.currentIdCity || undefined,
      service: this.currentService || undefined,
      name: this.cityName || undefined,
      categoria: this.categoriaFilter || undefined,
    });
  }


  private loadMarkers(params: {
    id_city?: string;
    name?: string;
    salonName?: string;
    categoria?: string;
    service?: string;
  }): void {

    //console.log('Aplicando filtros: ', {
      //horarioFilter: this.horarioFilter,
      //categoriaFilter: this.categoriaFilter,
    //});
    //console.log('Parámetros de entrada:', params);

    this.isLoading = true;
    let markerObservable: Observable<{ salons: any[] }>;

    if (params.id_city && params.service) {
      markerObservable = this.unRegisteredSearchBusinessService
        .searchByService(params.id_city, params.service)
        .pipe(map((salons: any[]) => ({ salons })));
    } else if (params.id_city && params.categoria) {
      markerObservable = this.unRegisteredSearchBusinessService
        .searchByCityAndCategory(params.id_city, params.categoria)
        .pipe(map((salons: any[]) => ({ salons })));
    } else if (params.id_city) {
      markerObservable = this.unRegisteredSearchBusinessService
        .searchByCity(params.id_city)
        .pipe(map((salons: any[]) => ({ salons })));
    } else if (params.name) {
      markerObservable = this.unRegisteredSearchBusinessService
      .searchByCityName(params.name, params.categoria)
      .pipe(map((response) => ({ salons: response.salons })));
  } else if (params.salonName) {
    markerObservable = this.unRegisteredSearchBusinessService
      .searchByName(params.salonName)
      .pipe(map((salons: any[]) => ({ salons })));
  } else {
      this.fadeOutLoadingSpinner();
      return;
    }

    // Suscribirse al observable y aplicar filtros
    markerObservable.subscribe(
      (response) => {
        let markers = response.salons;
        //console.log('Array de salones:', markers);
        // Aplicar filtro de horario (abierto o cerrado)
        if (this.horarioFilter === 'true') {
          markers = markers.filter((marker) => marker.is_open === true);
        } else if (this.horarioFilter === 'false') {
          markers = markers.filter((marker) => marker.is_open === false);
        }

        // Aplicar filtro de categoría si está seleccionado



        //console.log('Marcadores después de aplicar filtros:', markers);

        // Continuar con la lógica de carga de marcadores...
        this.markerLayer!.clearLayers();
        this.visibleMarkers = [];
        this.markersMap.clear();

        if (markers.length > 0) {
          const bounds = L.latLngBounds(
            markers.map((marker) => [marker.latitud, marker.longitud])
          );
          this.map?.fitBounds(bounds);
        }

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

                return `<div style="display: flex; align-items: center; padding: 0; font-family: Arial, sans-serif;">
                    <img src="${
                      imageUrl || '../../../assets/img/web/sello.jpg'
                    }"
                         alt="${marker.name}"
                         style="width: 90px; height: 90px; object-fit: cover; margin-right: 10px;"
                         onerror="this.src='../../../assets/img/web/sello.jpg';" />
                    <div style="flex-grow: 1;">
                      <div style="font-weight: bold;">${marker.name}</div>
                      <div>${marker.address}</div>
                      <button id="info-link-${index}" data-id="${
                  marker.id_salon
                }"
                              style="background: gray; border: none; color: white; cursor: pointer;">
                        +info
                      </button>
                    </div>
                  </div>`;
              });

            markerInstance.on('popupopen', () => {
              const infoLink = document.getElementById(`info-link-${index}`);
              if (infoLink) {
                infoLink.addEventListener('click', (event) => {
                  event.preventDefault();
                  this.viewDetails(marker.id_salon, marker.name);
                });
              }
            });

            this.visibleMarkers.push(marker);
            this.markersMap.set(marker, markerInstance);
            this.getImagesAdmin(marker.id_salon);
          }
        });

        this.currentPage = 1;
        this.paginateMarkers();
        this.fadeOutLoadingSpinner();
      },
      (error) => {
        console.error('Error loading markers:', error);
        this.fadeOutLoadingSpinner();
      }
    );
  }

  onImageError(event: any) {
    event.target.src = '../../../assets/img/web/sello.jpg';
  }

  openLoginModal(): void {
    const modalRef = this.modalService.open(LoginComponent);
    modalRef.componentInstance.redirectUrl = '/business';
  }

  private getImagesAdmin(id: string): void {
    this.unRegisteredSearchBusinessService.getImagesAdmin(id).subscribe(
      (images) => {
        if (images.length > 0) {
          const marker = this.visibleMarkers.find((m) => m.id_salon === id);
          if (marker) {
            marker.images = images.sort(
              (a, b) => b.file_principal - a.file_principal
            );
          }
        }
      },
      (error) => console.error('Error loading images', error)
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
          this.loadMarkers({ id_city });
          this.selectedMarker = null;
          this.currentPage = 1;
        }
      });

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        console.log('Map clicked at', e.latlng);

        if (!this.selectedMarker) {
          this.applyBlurEffect(false);
        }

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
        this.cdr.detectChanges();
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
    return Array(Math.ceil(this.visibleMarkers.length / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i + 1);
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

  public viewDetails(id: any, salonName: string): void {
    if (id && salonName) {
      // Generar el slug del salón a partir del nombre
      const salonSlug = salonName
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');

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
        } else {
          console.error('Unexpected response format:', response);
          this.toasrt.success('Error,intentelo de nuevo mas tarde');
        }
      },
      (error) => {
        this.toasrt.success('El salón ya esta en su lista de favoritos');
        console.error('Error adding favorite', error);
      }
    );
  }
}
