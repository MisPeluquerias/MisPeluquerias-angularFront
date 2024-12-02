import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaServiceService {

  constructor(private meta : Meta) { }

  metaDescription(): void {
    const description = 'Encuentra los mejores salones de belleza, peluquerías, salones de belleza, barberías, academias de peluquería y centros de depilación láser cerca de ti en MisPeluquerias.com. Disfruta de servicios de calidad, reseñas auténticas y ofertas de empleo. ¡Tu estilo y bienestar son nuestra prioridad!';

    this.meta.updateTag({ name: 'description', content: description });
  }
}
