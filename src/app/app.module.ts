import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule,provideHttpClient,withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './shared/components/navbar-home-background/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchBarComponent } from './shared/components/navbar-home-search/search-bar.component';
import { TermsComponent } from './components/home/terms/terms.component';
import { PrivacyComponent } from './components/home/privacy/privacy.component';
import { WarningComponent } from './components/home/warning/warning.component';
import { CookiesComponent } from './components/home/cookies/cookies.component';
import { FaqComponent } from './components/home/faq/faq.component';
import { ContactComponent } from './components/home/contact/contact.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactProfesionalComponent } from './components/home/contact-profesional/contact-profesional.component';
import { SalonReclamationComponent } from './components/home/salon-reclamation/salon-reclamation.component';
import { LoginComponent } from './auth/login/login.component';
import { NavbarFixedComponent } from './shared/components/navbar-fixed/navbar-fixed.component';
import { CarouselModule } from 'primeng/carousel';
import { RegisterComponent } from './auth/register/register.component';
import { SearchBusinessComponent } from './components/search-business/search-business.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../jwt.interceptor';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './core/guards/auth.guard';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
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
    SearchBusinessComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    CarouselModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthGuard,
    provideClientHydration(),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
