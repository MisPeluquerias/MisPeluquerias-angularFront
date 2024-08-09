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
    private detailsBusiness: DetailsBusinesstService,
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
      const id = params['id'];
      this.idSalon = id;
      if (id) {
        this.unRegisteredSearchBuusinessService.viewDetailsBusiness(id).subscribe(
          data => {
            if (data.length > 0) {
              this.business = data[0];
              this.business.hours_old = this.sortHours(this.business.hours_old);
              console.log(data);

              this.loadReviews(id);
              this.loadFaq(id);
              this.getImagesAdmin(id)

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

  private getImagesAdmin(id: string): void {
    this.detailsBusiness.getImagesAdmin(id).subscribe(
      images => {
        // Ordenar imágenes para que la principal esté primero
        this.images = images.sort((a, b) => b.file_principal - a.file_principal);
        console.log('Imágenes cargadas y ordenadas:', this.images);
      },
      error => console.error('Error loading images', error)
    );
  }


  private loadReviews(id: string): void {
    this.detailsBusiness.loadReview(id).subscribe(
      reviews => {
        this.reviews = reviews;
        console.log('Reseñas cargadas:', reviews);
      },
      error => console.error('Error loading reviews', error)
    );
  }

  private loadFaq(id: string): void {
    this.detailsBusiness.loadFaq(id).subscribe(
      faqs => {
        this.faqs = faqs;
        console.log('Preguntas cargadas:', faqs);
      },
      error => console.error('Error loading faq', error)
    );
  }

  private loadServices(id: string): void {
    this.detailsBusiness.loadServices(id).subscribe(
      services => {
        this.services = services;
        console.log('Servicios cargados:', services);
      },
      error => console.error('Error loading services', error)
    );
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
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
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

    this.detailsBusiness.saveReview(id_user, id_salon, observacion, qualification).subscribe(
      response => {
        console.log('Reseña guardada:', response);
        this.loadReviews(id_salon);
      },
      error => console.error('Error guardando la reseña', error)
    );
  }

  updateReview(): void {
    const updatedReview = {
      ...this.reviewToEdit,
      observacion: this.editReviewText,
      qualification: this.editRating
    };

    this.detailsBusiness.updateReview(updatedReview).subscribe(
      response => {
        console.log('Reseña actualizada:', response);
        this.loadReviews(this.idSalon!);
      },
      error => console.error('Error actualizando la reseña', error)
    );
  }

  editReview(review: any): void {
    this.reviewToEdit = review;
    this.editReviewText = review.observacion;
    this.editRating = review.qualification;
  }

  deleteReview(reviewId: string): void {
    console.log('Eliminar reseña con ID:', reviewId);
    if (this.idSalon) {
      this.detailsBusiness.deleteReview(reviewId).subscribe(
        response => {
          console.log('Reseña eliminada:', response);
          this.loadReviews(this.idSalon!);
        },
        error => console.error('Error eliminando la reseña', error)
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

    this.detailsBusiness.saveFaq(id_user, id_salon, question).subscribe(
      response => {
        console.log('Pregunta guardada:', response);
        this.loadFaq(id_salon);
        this.questionText = ''; // Limpiar la pregunta después de guardar
      },
      error => console.error('Error guardando la pregunta', error)
    );
  }

  updateQuestion(): void {
    const updatedQuestion = {
      id_faq: this.faqToEdit.id_faq,
      answer: this.editAnswerText
    };

    this.detailsBusiness.updateFaq(updatedQuestion.id_faq, updatedQuestion.answer).subscribe(
      response => {
        console.log('Pregunta actualizada:', response);
        this.loadFaq(this.idSalon!);
      },
      error => console.error('Error actualizando la pregunta', error)
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
      this.detailsBusiness.deleteFaq(id_faq).subscribe(
        response => {
          console.log('Pregunta eliminada:', response);
          this.loadFaq(this.idSalon!);
        },
        error => console.error('Error eliminando la pregunta', error)
      );
    } else {
      console.error('No se encontró el ID del salón.');
    }
  }
}
