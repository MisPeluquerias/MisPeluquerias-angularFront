import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import * as L from 'leaflet';
import { DetailsBusinesstService } from '../../core/services/details-business.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/AuthService.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginComponent } from '../../auth/login/login.component';

@Component({
  selector: 'app-details-business',
  templateUrl: './details-business.component.html',
  styleUrls: ['./details-business.component.scss']
})
export class DetailsBusinessComponent implements OnInit, AfterViewInit {
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
  idSalon: string | undefined;
  editReviewText: string = '';
  editRating: string = '';
  reviewToEdit: any;
  questionText: string = '';
  editQuestionText: string = '';
  editAnswerText: string = '';
  faqToEdit: any;
  userType: string = 'client';

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private unRegisteredSearchBuusinessService: UnRegisteredSearchBuusinessService,
    private detailsBusinessService: DetailsBusinesstService,
    private modalService: NgbModal,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.currentDay = this.getCurrentDay();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.userId = localStorage.getItem('usuarioId');
  
    this.authService.getUserType().subscribe(userType => {
      this.userType = userType;
    });
  
    this.route.params.subscribe(params => {
      const slug = params['salonSlug'];  // Extrae el slug
      const id = params['id'];  // Extrae el ID numérico
      //console.log('Slug extraído de la URL:', slug); // Depuración
      //console.log('ID extraído de la URL:', id);  // Depuración
  
      this.idSalon = id;
  
      if (id) {
        //console.log('Solicitando datos para el ID:', id); // Depuración
        this.unRegisteredSearchBuusinessService.viewDetailsBusiness(id).subscribe(
          data => {
            //console.log('Datos recibidos del negocio:', data); // Depuración
            if (data.length > 0) {
              this.business = data[0];
              this.business.hours_old = this.sortHours(this.business.hours_old);
  
              this.loadReviews(id);
              this.loadFaq(id);
              this.getImagesAdmin(id);
              this.getServicesSalon(id);
              this.getDescriptionSalon(id);
  
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

  private loadReviews(id: string): void {
    //console.log('Cargando reseñas para el ID:', id); // Depuración: Verifica cuando se cargan las reseñas
    this.detailsBusinessService.loadReview(id).subscribe(
      reviews => {
        this.reviews = reviews;
        //console.log('Reseñas cargadas:', this.reviews); // Depuración: Verifica las reseñas cargadas
      },
      error => console.error('Error al cargar reseñas para el ID:', id, error)
    );
  }

  private loadFaq(id: string): void {
    //console.log('Cargando preguntas frecuentes para el ID:', id); // Depuración: Verifica cuando se cargan las preguntas frecuentes
    this.detailsBusinessService.loadFaq(id).subscribe(
      faqs => {
        this.faqs = faqs;
        //console.log('Preguntas frecuentes cargadas:', this.faqs); // Depuración: Verifica las preguntas frecuentes cargadas
      },
      error => console.error('Error al cargar preguntas frecuentes para el ID:', id, error)
    );
  }

  private getServicesSalon(id_salon: string): void {
    //console.log('Cargando servicios para el ID:', id_salon); // Depuración: Verifica cuando se cargan los servicios
    this.detailsBusinessService.getServicesSalon(id_salon).subscribe(
      (response: any) => {
        if (response && Array.isArray(response.services)) {
          this.services = response.services;
          //console.log('Servicios cargados:', this.services); // Depuración: Verifica los servicios cargados
        } else {
          console.error('La propiedad `services` no es un array para el ID:', id_salon, response); // Depuración: Verifica si hay un error en la respuesta
          this.services = [];
        }
      },
      error => {
        console.error('Error al cargar servicios para el ID:', id_salon, error);
        this.services = [];
      }
    );
  }

  ngAfterViewInit(): void {}

  private initMap(): void {
    if (!this.business) return;

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

  private sortHours(hours: string | null): string {
    if (!hours) return '';

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

  openLoginModal(): void {
    this.modalService.open(LoginComponent);
  }

  submitReview(): void {
    const id_user = this.userId;
    if (!id_user) {
      console.error('No se encontró el ID del usuario en el almacenamiento local.');
      return;
    }

    if (!this.idSalon) {
      console.error('No se encontró el ID del salón.');
      return;
    }

    const id_salon = this.idSalon;
    const observacion = this.reviewText;
    const qualification = this.rating;

    this.detailsBusinessService.saveReview(id_user, id_salon, observacion, qualification).subscribe(
      response => {
        //console.log('Reseña guardada:', response);
        this.loadReviews(id_salon);
      },
      error => console.error('Error al guardar la reseña', error)
    );
  }

  updateReview(): void {
    const updatedReview = {
      ...this.reviewToEdit,
      observacion: this.editReviewText,
      qualification: this.editRating
    };

    this.detailsBusinessService.updateReview(updatedReview).subscribe(
      response => {
        //console.log('Reseña actualizada:', response);
        this.loadReviews(this.idSalon!);
      },
      error => console.error('Error al actualizar la reseña', error)
    );
  }

  editReview(review: any): void {
    this.reviewToEdit = review;
    this.editReviewText = review.observacion;
    this.editRating = review.qualification;
  }

  deleteReview(reviewId: string): void {
    //console.log('Eliminar reseña con ID:', reviewId);
    if (this.idSalon) {
      this.detailsBusinessService.deleteReview(reviewId).subscribe(
        response => {
          //console.log('Reseña eliminada:', response);
          this.loadReviews(this.idSalon!);
        },
        error => console.error('Error al eliminar la reseña', error)
      );
    } else {
      console.error('No se encontró el ID del salón.');
    }
  }

  submitQuestion(): void {
    const id_user = this.userId;
    if (!id_user) {
      console.error('No se encontró el ID del usuario en el almacenamiento local.');
      return;
    }

    if (!this.idSalon) {
      console.error('No se encontró el ID del salón.');
      return;
    }

    const id_salon = this.idSalon;
    const question = this.questionText;

    this.detailsBusinessService.saveFaq(id_user, id_salon, question).subscribe(
      response => {
        //console.log('Pregunta guardada:', response);
        this.loadFaq(id_salon);
        this.questionText = '';
      },
      error => console.error('Error al guardar la pregunta', error)
    );
  }

  updateQuestion(): void {
    const updatedQuestion = {
      id_faq: this.faqToEdit.id_faq,
      answer: this.editAnswerText
    };

    this.detailsBusinessService.updateFaq(updatedQuestion.id_faq, updatedQuestion.answer).subscribe(
      response => {
        //console.log('Pregunta actualizada:', response);
        this.loadFaq(this.idSalon!);
      },
      error => console.error('Error al actualizar la pregunta', error)
    );
  }

  editQuestion(faq: any): void {
    this.faqToEdit = faq;
    this.editQuestionText = faq.question;
    this.editAnswerText = faq.answer;
  }

  deleteQuestion(id_faq: string): void {
    console.log('Eliminar pregunta con ID:', id_faq);
    if (this.idSalon) {
      this.detailsBusinessService.deleteFaq(id_faq).subscribe(
        response => {
          //console.log('Pregunta eliminada:', response);
          this.loadFaq(this.idSalon!);
        },
        error => console.error('Error al eliminar la pregunta', error)
      );
    } else {
      console.error('No se encontró el ID del salón.');
    }
  }
}
