import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TermsComponent } from './components/home/terms/terms.component';
import { PrivacyComponent } from './components/home/privacy/privacy.component';
import { WarningComponent } from './components/home/warning/warning.component';
import { CookiesComponent } from './components/home/cookies/cookies.component';
import { FaqComponent } from './components/home/faq/faq.component';
import { ContactComponent } from './components/home/contact/contact.component';
import { ContactProfesionalComponent } from './components/home/contact-profesional/contact-profesional.component';
import { SalonReclamationComponent } from './components/home/salon-reclamation/salon-reclamation.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisteredSearchBusinessComponent } from './components/registered-search-map-business/registered-search-map-business.component';
import { AuthGuard } from './core/guards/auth.guard';
import { UnRegisteredSearchBusinessComponent } from './components/unregistered-search-map-business copy/unregistered-search-map-business.component';
import { DetailsBusinessComponent } from './components/details-business/details-business.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },

  {
    path: 'terminos-y-condiciones',
    component: TermsComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },

  {
    path: 'politica-de-privacidad',
    component: PrivacyComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'aviso-legal',
    component: WarningComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'cookies',
    component: CookiesComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'preguntas-frecuentes',
    component: FaqComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'contacto',
    component: ContactComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },

  {
    path: 'profesionales',
    component: ContactProfesionalComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'reclamation',
    component: SalonReclamationComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'business',
    component: RegisteredSearchBusinessComponent, canActivate: [AuthGuard],
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },

  {
    path: 'unregistered-search',
    component: UnRegisteredSearchBusinessComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'details-business/:id',
    component: DetailsBusinessComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },



  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' }) 
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
