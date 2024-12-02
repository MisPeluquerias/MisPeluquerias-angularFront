import { Component } from '@angular/core';
import { MetaServiceService } from './core/services/meta-service.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'MisPeluquerias-angularFront';
  constructor(private metaService:MetaServiceService){}

  ngOnInit(): void {
    this.metaService.metaDescription();

  }
}
