import { Observable } from 'rxjs';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import * as L from 'leaflet';
import { DetailsBusinesstService } from '../../core/services/details-business.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/AuthService.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { LoginComponent } from '../../auth/login/login.component';
import { ToastrService } from 'ngx-toastr'
import { FavoriteSalonService } from '../../core/services/favorite-salon.service';




@Component({
  selector: 'app-details-business',
  templateUrl: './details-business.component.html',
  styleUrls: ['./details-business.component.scss']
})
export class DetailsBusinessComponent implements OnInit {
  business: any;
  private map: L.Map | undefined;
  currentDay: string;
  reviews: any[] = [];
  faqs: any[] = [];
  services: any[] = [];
  images: any[] = [];
  descriptionSalon: any[] = [];
  reviewText: string = '';
  rating: string = '';
  userId: string | null = null;
  userioId: string | null = null;
  idSalon: string | undefined;
  editReviewText: string = '';
  editRating: string = '';
  reviewToEdit: any;
  questionText: string = '';
  editQuestionText: string = '';
  editAnswerText: string = '';
  faqToEdit: any;
  userType: string = 'client';
  selectedService: any;
  ratingBreakdown:any[] = [];
  reviewData:any=[];
  averageRatings:any={}
  stars: string[] = [];
  starsObservation: number[] = [];
  total_reviews: number = 280;
  excelentePercent: number = 42;
  muyBuenoPercent: number = 22;
  normalPercent: number = 16;
  maloPercent: number = 14;
  pesimoPercent: number = 2;
  ratingPorcent:any=[];
  isUserAuthenticated: boolean = false;
  ratings = {
    service: [false, false, false, false, false],
    quality: [false, false, false, false, false],
    cleanliness: [false, false, false, false, false],
    speed: [false, false, false, false, false]
  };
  additionalComments: string = '';
  loginForm: FormGroup;
  errorMessage: string = '';
  observations: any[] = [];
  currentPage = 1; // Página actual
  limit = 2; // Reseñas por página
  hasMorePages = true; // Determina si hay más páginas
 reviewToDeleteId: string | null = null;
 totalPages: any;
 selectedFaq: any = {};
 idFaqToDelete: number | null = null;
 usuarioId: string | null = null;
 getBrandsSalon:any;
 slides: any[] = [];
 currentStatus: string="";
 salonData:any=[]
 searchFaqText = '';



  constructor(
    private route: ActivatedRoute,
    private unRegisteredSearchBuusinessService: UnRegisteredSearchBuusinessService,
    private detailsBusinessService: DetailsBusinesstService,
    private modalService: NgbModal,
    public authService: AuthService,
    private fb: FormBuilder,
    private toastr:ToastrService,
    private favoriteSalonService: FavoriteSalonService,

  ) {
    this.currentDay = this.getCurrentDay();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {

    this.userId = localStorage.getItem('usuarioId');

    this.isUserAuthenticated=this.authService.isAuthenticated();

    this.authService.getUserType().subscribe(userType => {
      this.userType = userType;
    });

    this.route.params.subscribe(params => {
      const slug = params['salonSlug'];
      const id = params['id'];
      this.idSalon = id;
      if (id) {
        this.unRegisteredSearchBuusinessService.viewDetailsBusiness(id).subscribe(
          data => {
            if (data.length > 0) {
              this.business = data[0];

              console.log('Datos recibidos del salón:',this.business);
              // Formatear los horarios para mostrarlos como en Google
              this.business.formattedHours = this.formatHours(this.business.hours_old);
              console.log(this.business.formattedHours);
              this.getScoreReviewSalon();
              this.getObservationReviewSalon();
              this.getFaqs(id);
              this.getImagesAdmin(id);

              this.getServicesSalon(id);
              this.getDescriptionSalon(id);
              this.detailsBusinessService.getBrandByIdSalon(this.idSalon).subscribe({
                next: (brand) => {
                  this.slides = brand.map(brand => ({
                    img: brand.imagePath,
                    title: brand.name,
                    id:brand.id_brand
                  }));
                },
                error: (error) => {
                  console.error('Error al obtener las brandes del salón:', error);
                }
              });
              setTimeout(() => {
                this.initMap();
              }, 0);
            } else {
              console.error('No se encontraron datos del negocio para el ID:', id);
            }
          },
          error => {
            console.error('Error al cargar los detalles del negocio:', error);
          }
        );
      } else {
        console.error('No se encontró el ID en la URL');
      }
    });

    const token = localStorage.getItem('usuarioId'); // Obtener el token del localStorage
    console.log('Token recuperado:', token);
    if (token) {
      // Llamar al servicio para decodificar el token
      this.detailsBusinessService.getUsuarioId(token).subscribe(
        (response) => {
          this.userioId = response.usuarioId; // Aquí obtienes el usuarioId decodificado
        },
        (error) => {
          console.error('Error al obtener el usuarioId:', error);
        }
      );
    }
  }


  onImageError(event: any) {
    event.target.src = '../../../assets/img/web/sello.jpg';
  }


  onSearch(): void {
    if (this.searchFaqText.trim().length >= 2) {
      // Si hay texto en la búsqueda, filtra las FAQs
      this.detailsBusinessService.searchFaqs(this.idSalon!, this.searchFaqText).subscribe(
        response => {
          this.faqs = response.faqs;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.hasMorePages = this.currentPage < this.totalPages;
        },
        error => console.error('Error al buscar FAQs:', error)
      );
    } else {
      // Si no hay texto de búsqueda, cargar las FAQs normalmente
      this.getFaqs(this.idSalon!, this.currentPage);
    }
  }


  verifyUser(){
    if(!this.authService.isAuthenticated()){
      this.openLoginModal();
    }
  }


  setFaqToDelete(id_faq: number) {
    this.idFaqToDelete = id_faq;
  }


   confirmDeleteFaq() {
    if (this.idFaqToDelete !== null) {
      this.detailsBusinessService.deleteFaq(this.idFaqToDelete).subscribe({
        next: () => {
          this.toastr.success('Pregunta eliminada con éxito');
          this.getFaqs(this.idSalon!); // Refrescar la lista de FAQs
          this.idFaqToDelete = null; // Limpiar el ID después de la eliminación
        },
        error: (error) => {
          console.error('Error al eliminar la pregunta', error);
          this.toastr.error('No se pudo eliminar la pregunta, inténtelo de nuevo.');
        }
      });
    }
  }


  updateFaq() {
    const { id_faq, question } = this.selectedFaq;
    this.detailsBusinessService.updateFaq(id_faq, question).subscribe(
      (response) => {
        this.getFaqs(this.idSalon!);
        this.toastr.success('Pregunta actualizada con éxito');
        console.log('Pregunta actualizada con éxito', response);
        // Aquí puedes manejar la respuesta, como cerrar el modal o mostrar un mensaje
      },
      (error) => {
        this.toastr.error('Error al actualizar la pregunta');
        console.error('Error al actualizar la pregunta', error);
      }
    );
  }


  generateStars(rating: number): void {
    this.stars = Array(5).fill(0).map((_, i) => {
      if (i + 1 <= rating) {
        return 'fas fa-star';
      } else if (i < rating && i + 1 > rating) {
        return 'fas fa-star-half-alt';
      } else {
        return 'far fa-star';
      }
    });
  }



  updateRatings(ratingArray: boolean[], index: number): void {
    // Marca los checkboxes anteriores si uno es seleccionado
    if (ratingArray[index]) {
      for (let i = 0; i <= index; i++) {
        ratingArray[i] = true;
      }
    } else {
      // Desmarca los checkboxes siguientes si uno es deseleccionado
      for (let i = index + 1; i < ratingArray.length; i++) {
        ratingArray[i] = false;
      }
    }
  }


  private formatHours(hoursOld: string): string {
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const todayIndex = new Date().getDay();
    const currentDay = daysOfWeek[(todayIndex + 6) % 7];
    const currentTime = new Date();
    const days = hoursOld.split(';').map(day => day.trim()).filter(day => day.length > 0);
    const dayMap = new Map<string, string>();

    days.forEach(day => {
        const [dayName, ...hours] = day.split(':').map(part => part.trim());
        if (dayName && hours.length > 0) {
            dayMap.set(dayName, hours.join(':'));
        }
    });

    // Establece el estado actual del negocio (abierto/cerrado)
    this.currentStatus = 'Cerrado';
    if (dayMap.has(currentDay)) {
        const hours = dayMap.get(currentDay);
        if (hours && hours !== 'Cerrado') {
            const timeRanges = hours.split(',').map(range => range.trim());
            for (const range of timeRanges) {
                const [aperturaStr, cierreStr] = range.split('-').map(time => time.trim());
                const [aperturaHora, aperturaMin] = aperturaStr.split(':').map(Number);
                const [cierreHora, cierreMin] = cierreStr.split(':').map(Number);

                const apertura = new Date();
                apertura.setHours(aperturaHora, aperturaMin, 0);

                const cierre = new Date();
                cierre.setHours(cierreHora, cierreMin, 0);

                if (currentTime >= apertura && currentTime <= cierre) {
                    this.currentStatus = 'Abierto ahora';
                    break;
                }
            }
        }
    }

    // Crear el HTML formateado con flexbox
    const formattedHours = daysOfWeek.map(dayName => {
        const hours = dayMap.get(dayName) || 'Cerrado';
        const formattedDay = `
            <div class="d-flex justify-content-between">
               <span>\u2022 ${dayName}:</span>
              <span class="ms-auto">${hours}</span>
            </div>`;

        if (dayName === currentDay) {
            return `<b>${formattedDay}</b>`;
        }
        return formattedDay;
    }).join('<br>'); // Utiliza <br> para separar las líneas

    return formattedHours;
}




  // Función para abrir la página de Google Maps con las coordenadas del salón
  openDirections(): void {
    if (this.business) {
      const lat = this.business.latitud;
      const lng = this.business.longitud;
      const name = encodeURIComponent(this.business.name);

      // URL para Google Maps con las coordenadas
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;

      // Abre la URL en una nueva pestaña o ventana
      window.open(url, '_blank');
    } else {
      console.error('Información del negocio no disponible para obtener direcciones.');
    }
  }
  private getImagesAdmin(id: string): void {
    //console.log('Cargando imágenes para el ID:', id); // Depuración: Verifica cuando se cargan las imágenes
    this.detailsBusinessService.getImagesAdmin(id).subscribe(
      images => {
        this.images = images.sort((a, b) => b.file_principal - a.file_principal);
        //console.log('Imágenes cargadas:', this.images); // Depuración: Verifica las imágenes cargadas
      },
      error => console.error('Error al cargar imágenes para el ID:', id, error)
    );
  }

  getDescriptionSalon(id: string): void {
    //console.log('Cargando descripción para el ID:', id); // Depuración: Verifica cuando se carga la descripción
    this.detailsBusinessService.getDescrptionSalon(id).subscribe(
      description => {
        this.descriptionSalon = description;
        //console.log('Descripción del salón cargada:', this.descriptionSalon); // Depuración: Verifica la descripción cargada
      },
      error => console.error('Error al cargar la descripción del salón para el ID:', id, error)
    );
  }


  getFaqs(id: string, page: number = 1, limit: number = 4): void {
    this.detailsBusinessService.getFaqs(id, page, limit).subscribe(
      response => {
        this.faqs = response.faqs;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.hasMorePages = this.currentPage < this.totalPages;
      },
      error => console.error('Error al cargar preguntas frecuentes para el ID:', id, error)
    );
  }


  previousPageFaq(): void {
    if (this.currentPage > 1) {
      this.getFaqs(this.idSalon!, this.currentPage - 1);
    }
  }


  nextPageFaq(): void {
    if (this.currentPage < this.totalPages) {
      this.getFaqs(this.idSalon!, this.currentPage + 1);
    }
  }



  openServiceModal(service: any): void {
    this.selectedService = service;
  }


  private getServicesSalon(id_salon: string): void {
    this.detailsBusinessService.getServicesSalon(id_salon).subscribe(
      (response: any) => {
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          this.services = Object.entries(response).map(([serviceName, subservices]) => {
            const validSubservices = Array.isArray(subservices) ? subservices : [];
            return {
              serviceName,
              subservices: validSubservices
            };
          });

          console.log('Servicios cargados:', this.services); // Depuración: Verifica los servicios cargados
        } else {
          console.error('La propiedad `services` no es un array para el ID:', id_salon, response); // Depuración: Verifica si hay un error en la respuesta
          this.services = [];
        }
      },
      (error) => {
        console.error('Error al cargar servicios para el ID:', id_salon, error);
        this.services = [];
      }
    );
  }


  private initMap(): void {
    if (!this.business) return;


    if (this.map) {
      this.map.remove(); // Elimina el mapa anterior
    }

    //console.log('Inicializando mapa con latitud:', this.business.latitud, 'y longitud:', this.business.longitud); // Depuración: Verifica las coordenadas del mapa
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
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    L.marker([this.business.latitud, this.business.longitud], { icon: customIcon }).addTo(this.map)
      .bindPopup(`<b>${this.business.name}</b><br>${this.business.address}`).openPopup();
  }

  private getCurrentDay(): string {
    const daysOrder = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const currentDayIndex = new Date().getDay();
    return daysOrder[currentDayIndex];
  }

  openLoginModal(): void {
    this.modalService.open(LoginComponent);
  }

  formatQualification(qualification: number): string {
    // Si el número es entero, agrega ",0"
    if (Number.isInteger(qualification)) {
      return qualification.toFixed(1).replace('.', ',');
    }
    // Si el número tiene decimales, simplemente reemplaza el punto por la coma
    return qualification.toString().replace('.', ',');
  }

  addReview(): void {
    const id_user = this.userId;

    if (!id_user) {
      console.error('No se encontró el ID del usuario en el almacenamiento local.');
      return;
    }

    if (!this.idSalon) {
      console.error('No se encontró el ID del salón.');
      return;
    }

    if(!this.additionalComments){
      this.toastr.error('Por favor completa todos los campos antes de enviar la reseña');
      console.log('No se encontró el texto de la reseña.');
      return;
    }

    // Función para contar los valores true en un array
    const countTrueValues = (array: boolean[]): number => {
      return array.filter(value => value).length;
    };

    // Convertir los arrays de ratings a números contando los valores true
    const numericRatings = {
      service: countTrueValues(this.ratings.service),
      quality: countTrueValues(this.ratings.quality),
      cleanliness: countTrueValues(this.ratings.cleanliness),
      speed: countTrueValues(this.ratings.speed),
    };

    if(numericRatings.service === 0 || numericRatings.quality === 0 || numericRatings.cleanliness === 0 || numericRatings.speed === 0){
      this.toastr.error('Por favor selecciona al menos una opción  calificación');
      console.log('No se encontraron opciones para la calificación.');
      return;
    }

    // Convertir los ratings a un formato string o JSON que tu backend espere
    const qualification = JSON.stringify(numericRatings); // Ajusta si tu API necesita un formato diferente

    const averageQualification = Math.round(((numericRatings.service + numericRatings.quality + numericRatings.cleanliness + numericRatings.speed) / 4) * 2) / 2;
    const observacion = this.additionalComments;

    // Llamar al servicio para enviar los datos
    this.detailsBusinessService.adddReview(id_user, this.idSalon, observacion, qualification,averageQualification).subscribe({
      next: (response) => {
        console.log('Media envida',averageQualification);
        console.log('Reseña enviada exitosamente:', response);
        this.toastr.success('Su valoración fue enviada correctamente, gracias');
        this.getScoreReviewSalon();
        this.getObservationReviewSalon();
        // Lógica adicional como limpiar el formulario o  una notificación de éxito
      },
      error: (error) => {
        console.error('Error al enviar la reseña:', error);
        this.toastr.error('No pudimos guardar su valoracion, intentelo de nuevo mas tarde')
        // Mostrar mensaje de error o manejar el error de acuerdo a tu necesidad
      }
    });
  }

editReview(observation: any): void {
  this.reviewToEdit = observation;
  this.editReviewText = observation.observacion;
}


setReviewToDelete(reviewId: string): void {
  this.reviewToDeleteId = reviewId;
}


confirmDeleteReview(): void {
  if (this.reviewToDeleteId) {
    this.detailsBusinessService.deleteReview(this.reviewToDeleteId).subscribe({
      next: () => {
        this.toastr.success('Reseña eliminada con éxito');
        // Lógica adicional para recargar o actualizar la lista de reseñas
        this.getObservationReviewSalon();
        this.getScoreReviewSalon();
      },
      error: (error) => {
        console.error('Error al eliminar la reseña:', error);
        this.toastr.error('No se pudo eliminar la reseña, inténtelo de nuevo.');
      }
    });
    this.reviewToDeleteId = null; // Limpiar la variable después de la eliminación
  }
}


  getScoreReviewSalon() {
    // Verificar si existe el idSalon
    if (this.idSalon) {
      this.detailsBusinessService.getScoreReviews(this.idSalon).subscribe({
        next: (response: any) => {
          // Asignar los promedios recibidos del backend a las variables de puntuación
          this.averageRatings.promedio_servicio = response.promedio_servicio;
          this.averageRatings.promedio_calidad_precio = response.promedio_calidad_precio;
          this.averageRatings.promedio_limpieza = response.promedio_limpieza;
          this.averageRatings.promedio_puntualidad = response.promedio_puntualidad;
          this.averageRatings.promedio_qualification = response.promedio_qualification;
          this.averageRatings.total_reviews = response.total_reviews;
          this.generateStars(this.averageRatings.promedio_qualification);

          this.ratingPorcent = [
            { label: 'Excelente', percentage: response.porcentajes.excelente },
            { label: 'Muy bueno', percentage: response.porcentajes.muy_bueno },
            { label: 'Normal', percentage: response.porcentajes.normal },
            { label: 'Malo', percentage: response.porcentajes.malo },
            { label: 'Pésimo', percentage: response.porcentajes.pesimo }
          ];
          console.log('Datos de la reseña recibidos:', this.ratingPorcent);

        },
        error: (error) => {
          if (error.status === 404) {
            // Asignar valores predeterminados en caso de que no haya reseñas (error 404)
            this.averageRatings = {
              promedio_servicio: 0,
              promedio_calidad_precio: 0,
              promedio_limpieza: 0,
              promedio_puntualidad: 0,
              promedio_qualification: 0,
              total_reviews: 0
            };
            this.ratingPorcent = [
              { label: 'Excelente', percentage: 0 },
              { label: 'Muy bueno', percentage: 0 },
              { label: 'Normal', percentage: 0 },
              { label: 'Malo', percentage: 0 },
              { label: 'Pésimo', percentage: 0 }
            ];
            console.log('No hay reseñas para este salón.');
          } else {
            console.error('Error al obtener la reseña del salón:', error);
          }
        }
      });
    } else {
      console.error('No se encontró el ID del salón.');
    }
  }

  generateStarsObservation(rating: number): string[] {
    const stars: string[] = [];

    // Recorre las 5 posiciones de las estrellas
    for (let i = 0; i < 5; i++) {
      if (rating >= 1) {
        stars.push('fas fa-star'); // Estrella completa
        rating--; // Restamos 1 por cada estrella completa añadida
      } else if (rating >= 0.5) {
        stars.push('fas fa-star-half-alt'); // Media estrella
        rating -= 0.5; // Restamos 0.5 por cada media estrella
      } else {
        stars.push('far fa-star'); // Estrella vacía
      }
    }

    return stars;
  }

  addQuestion(): void {
    if (this.questionText.trim()) {
      const data = {
        id_user: this.userId,
        id_salon: this.idSalon,
        question: this.questionText
      };
      this.detailsBusinessService.addFaq(data).subscribe({
        next: (response: any) => {
          console.log('Pregunta agregada:', response);
          this.questionText = ''; // Limpiar el texto de la pregunta
          this.getFaqs(this.idSalon!);
        },
        error: (error) => {
          console.error('Error al agregar la pregunta:', error);
          this.toastr.error('No se pudo agregar la pregunta, inténtelo de nuevo.');
        }
      });
    }
  }

  getObservationReviewSalon(page: number = 1, limit: number = 2) {
    if (this.idSalon) {
      this.detailsBusinessService.getObservationReviews(this.idSalon, page, limit).subscribe({
        next: (response: any) => {
          //console.log('Response from server:', response); // Verifica la respuesta del servidor

          if (response && Array.isArray(response.results)) {
            this.observations = response.results.map((observation: any) => {
              const starsObservation = this.generateStarsObservation(observation.qualification);
              console.log('Observation:', observation); // Verifica los valores de cada observación
              console.log('Generated stars:', starsObservation);   // Verifica cómo se generan las estrellas
              return {
                ...observation,
                starsObservation: starsObservation // Asigna las estrellas generadas a cada observación
              };
            });

            this.currentPage = page;
            this.hasMorePages = (page * limit) < response.total;
          }
        },
        error: (err) => {
          console.error('Error fetching observations:', err); // Captura cualquier error en la llamada
        }
      });
    }
  }





  openEditModal(observation: any): void {
    this.reviewToEdit = observation;
    //console.log('Observation',observation);

    // Usamos la calificación general para todas las categorías
    const overallRating = observation.qualification;


    // Llenamos todas las categorías con la misma calificación general
    this.ratings = {
      service: this.getCheckboxState(observation.servicio),
      quality: this.getCheckboxState(observation.calidad_precio),
      cleanliness: this.getCheckboxState(observation.limpieza),
      speed: this.getCheckboxState(observation.puntualidad),
    };

    // Asignar los comentarios adicionales
    this.additionalComments = observation.observacion;

    //console.log('Estado de ratings:', this.ratings);
  }


  openEditFaqModal(faq: any) {
    this.selectedFaq = { ...faq }; // Clona el objeto faq para no modificarlo directamente
  }

  // Helper para convertir calificaciones numéricas en checkboxes booleanos
  getCheckboxState(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map((val) => val <= rating);
  }



  // Método para actualizar la reseña existente
  updateReview(): void {
    const updatedReview = {
      ...this.reviewToEdit, // Mantener otros datos de la reseña
      observacion: this.additionalComments,
      qualification: {
        service: this.countSelectedRatings(this.ratings.service),
        quality: this.countSelectedRatings(this.ratings.quality),
        cleanliness: this.countSelectedRatings(this.ratings.cleanliness),
        speed: this.countSelectedRatings(this.ratings.speed),
      }
    };

    // Llamada al servicio para actualizar la reseña en el backend
    this.detailsBusinessService.updateReview(updatedReview).subscribe({
      next: () => {
        this.toastr.success('Reseña actualizada con éxito');

        // Refrescar todos los datos
        this.getObservationReviewSalon();  // Recargar las reseñas
        this.getScoreReviewSalon();        // Recargar las puntuaciones


      },
      error: (error) => {
        //console.error('Error al actualizar la reseña:', error);
        this.toastr.error('No se pudo actualizar la reseña.');
      }
    });
  }

  shareUrl() {
    if (navigator.share) {
      // Si la Web Share API está disponible (por ejemplo, en Chrome)
      navigator.share({
        title: document.title,
        url: window.location.href
      })
      .then(() => {
        //this.toastr.success('Dirección compartida correctamente.');
      })
      .catch((error) => {
        console.error('Error al compartir:', error);
        this.toastr.error('Error al intentar compartir.');
      });
    } else {
      // Alternativa para navegadores sin soporte (por ejemplo, Firefox)
      const url = window.location.href;

      // Usa la API Clipboard para copiar la URL al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        this.toastr.success('La URL ha sido copiada al portapapeles.');
      }).catch((err) => {
        console.error('Error al copiar al portapapeles:', err);
        this.toastr.error('No se pudo copiar la URL al portapapeles.');
      });
    }
  }

  onFavoriteClick() {
    if (this.authService.isAuthenticated()) {
      const data = {
        id_user: this.userId,
        id_salon: this.idSalon
      };
      this.favoriteSalonService.addFavorite(data).subscribe(
        (res) => {
          this.toastr.success('Añadido a favoritos.');
        },
        (error) => {
          // Manejamos el error y mostramos un mensaje
          this.toastr.error('El salón ya esta en su lista de favoritos');
          console.error('Error al añadir a favoritos:', error);
        }
      );
    } else {
      // El usuario no está autenticado, mostrar el modal de login
      this.openLoginModal();
    }
  }

  // Helper para contar los ratings seleccionados
  countSelectedRatings(ratingArray: boolean[]): number {
    return ratingArray.filter(Boolean).length;
  }
}
