import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule,provideHttpClient,withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TermsComponent } from './shared/components/terms/terms.component';
import { PrivacyComponent } from './shared/components/privacy/privacy.component';
import { WarningComponent } from './shared/components/warning/warning.component';
import { CookiesComponent } from './shared/components/cookies/cookies.component';
import { FaqComponent } from './shared/components/faq/faq.component';
import { ContactComponent } from './shared/components/contact/contact.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactProfesionalComponent } from './shared/components/contact-profesional/contact-profesional.component';
import { SalonReclamationComponent } from './shared/components/salon-reclamation/salon-reclamation.component';
import { LoginComponent } from './auth/login/login.component';
import { NavbarFixedComponent } from './shared/components/navbar-fixed/navbar-fixed.component';
import { CarouselModule } from 'primeng/carousel';
import { RegisterComponent } from './auth/register/register.component';
import { RegisteredSearchBusinessComponent } from './components/registered-search-map-business/registered-search-map-business.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../jwt.interceptor';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './core/guards/auth.guard';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnRegisteredSearchBusinessComponent } from './components/unregistered-search-map-business copy/unregistered-search-map-business.component';
import { DetailsBusinessComponent } from './components/details-business/details-business.component';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { ProfileComponent } from './components/profile/profile.component';
import { FavoriteSalonComponent } from './components/favorite-salon/favorite-salon.component';
import { SessionExpiredModalComponent } from './shared/components/session-expired-modal/session-expired-modal.component';
import { CandidaturesComponent } from './components/candidatures/candidatures.component';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    TermsComponent,
    PrivacyComponent,
    WarningComponent,
    CookiesComponent,
    FaqComponent,
    ContactComponent,
    ContactProfesionalComponent,
    SalonReclamationComponent,
    LoginComponent,
    NavbarFixedComponent,
    RegisterComponent,
    RegisteredSearchBusinessComponent,
    UnRegisteredSearchBusinessComponent,
    DetailsBusinessComponent,
    ProfileComponent,
    FavoriteSalonComponent,
    SessionExpiredModalComponent,
    CandidaturesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxGoogleAnalyticsModule.forRoot('G-P1X7XKQGLW'),
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    CarouselModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-center-center',
      enableHtml: true,
      preventDuplicates: true,
      timeOut: 4000
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
