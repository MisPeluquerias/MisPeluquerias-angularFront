import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { UnRegisteredSearchBuusinessService } from '../../core/services/unregistered-search-business.service';
import * as L from 'leaflet';
import { DetailsBusinesstService } from '../../core/services/details-business.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/AuthService.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { LoginComponent } from '../../auth/login/login.component';
import { ToastrService } from 'ngx-toastr';


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
  selectedService: any;
  ratingBreakdown:any[] = [];
  reviewData:any=[];
  ratings = {
    service: [false, false, false, false, false],
    quality: [false, false, false, false, false],
    cleanliness: [false, false, false, false, false],
    speed: [false, false, false, false, false]
  };

  additionalComments: string = '';



  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private unRegisteredSearchBuusinessService: UnRegisteredSearchBuusinessService,
    private detailsBusinessService: DetailsBusinesstService,
    private modalService: NgbModal,
    public authService: AuthService,
    private fb: FormBuilder,
    private toastr:ToastrService
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
      const slug = params['salonSlug'];
      const id = params['id'];
      this.idSalon = id;


      if (id) {
        this.unRegisteredSearchBuusinessService.viewDetailsBusiness(id).subscribe(
          data => {
            if (data.length > 0) {
              this.business = data[0];
              // Formatear los horarios para mostrarlos como en Google
              this.business.formattedHours = this.formatHours(this.business.hours_old);
              console.log(this.business.formattedHours);
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
    this.getReviewSalon();
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
    const days = hoursOld.split(';').map(day => day.trim()).filter(day => day.length > 0);
    const dayMap = new Map<string, string>();

    days.forEach(day => {
        const [dayName, ...hours] = day.split(':').map(part => part.trim());
        if (dayName && hours.length > 0) {
            dayMap.set(dayName, hours.join(':'));
        }
    });

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
  openServiceModal(service: any): void {
    this.selectedService = service;
  }

  private getServicesSalon(id_salon: string): void {
    this.detailsBusinessService.getServicesSalon(id_salon).subscribe(
      (response: any) => {
        // Verifica si la respuesta es un objeto y no un array
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Convierte el objeto en un array de servicios
          this.services = Object.entries(response).map(([serviceName, subservices]) => {
            // Verificar si subservices es realmente un array
            const validSubservices = Array.isArray(subservices) ? subservices : [];
            return {
              serviceName,  // Nombre del servicio
              subservices: validSubservices   // Array de subservicios
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

  private getCurrentDay(): string {
    const daysOrder = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const currentDayIndex = new Date().getDay();
    return daysOrder[currentDayIndex];
  }

  openLoginModal(): void {
    this.modalService.open(LoginComponent);
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

    // Convertir los ratings a un formato string o JSON que tu backend espere
    const qualification = JSON.stringify(numericRatings); // Ajusta si tu API necesita un formato diferente

    // Obtener el valor del textarea para los comentarios
    const observacion = this.additionalComments;

    // Llamar al servicio para enviar los datos
    this.detailsBusinessService.adddReview(id_user, this.idSalon, observacion, qualification).subscribe({
      next: (response) => {
        console.log('Reseña enviada exitosamente:', response);
        this.toastr.success('Su valoración fue enviada correctamente, gracias');
        // Lógica adicional como limpiar el formulario o mostrar una notificación de éxito
      },
      error: (error) => {
        console.error('Error al enviar la reseña:', error);
        this.toastr.error('No pudimos guardar su valoracion, intentelo de nuevo mas tarde')
        // Mostrar mensaje de error o manejar el error de acuerdo a tu necesidad
      }
    });
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
  getReviewSalon() {
    // Verificar si existe el idSalon
    if (this.idSalon) {
      this.detailsBusinessService.getReviewSalon(this.idSalon).subscribe({
        next: (response) => {
          // Almacenar la respuesta recibida en una propiedad para mostrarla o procesarla
          this.reviewData = response;

          // Puedes agregar lógica adicional para procesar la respuesta si es necesario
          console.log('Datos de la reseña recibidos:', this.reviewData);
        },
        error: (error) => {
          // Manejo de errores si la llamada falla
          console.error('Error al obtener la reseña del salón:', error);
          // Aquí podrías mostrar un mensaje al usuario o manejar el error según tu aplicación
        }
      });
    } else {
      console.error('No se encontró el ID del salón.');
    }
  }
}
