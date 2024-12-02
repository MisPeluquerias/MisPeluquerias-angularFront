import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TermsComponent } from './shared/components/terms/terms.component';
import { PrivacyComponent } from './shared/components/privacy/privacy.component';
import { WarningComponent } from './shared/components/warning/warning.component';
import { CookiesComponent } from './shared/components/cookies/cookies.component';
import { FaqComponent } from './shared/components/faq/faq.component';
import { ContactComponent } from './shared/components/contact/contact.component';
import { ContactProfesionalComponent } from './shared/components/contact-profesional/contact-profesional.component';
import { SalonReclamationComponent } from './shared/components/salon-reclamation/salon-reclamation.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisteredSearchBusinessComponent } from './components/registered-search-map-business/registered-search-map-business.component';
import { AuthGuard } from './core/guards/auth.guard';
import { UnRegisteredSearchBusinessComponent } from './components/unregistered-search-map-business copy/unregistered-search-map-business.component';
import { DetailsBusinessComponent } from './components/details-business/details-business.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FavoriteSalonComponent } from './components/favorite-salon/favorite-salon.component';
import { CandidaturesComponent } from './components/candidatures/candidatures.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },

  { path: 'reclamation/:id_salon', component: SalonReclamationComponent ,
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
    path: 'centros',
    component: RegisteredSearchBusinessComponent, canActivate: [AuthGuard],
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },

  {
    path: 'buscador',
    component: UnRegisteredSearchBusinessComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'centro/:salonSlug/:id',
    component: DetailsBusinessComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'favorite',
    component: FavoriteSalonComponent,
    title: 'Mis Peluquerias | Encuentra tu salón perfecto',
  },
  {
    path: 'mis-candidaturas',
    component: CandidaturesComponent,
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
