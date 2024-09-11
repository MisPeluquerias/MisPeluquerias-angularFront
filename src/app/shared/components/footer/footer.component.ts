import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/AuthService.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../../../auth/login/login.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  isAuthenticated: boolean = false;


  constructor(private modalService:NgbModal,private authService: AuthService,){

  }

  ngOnInit(): void {
   this.isAuthenticated=this.authService.isAuthenticated();
  }

  openLoginModal(): void {
    const modalRef = this.modalService.open(LoginComponent);
    modalRef.componentInstance.redirectUrl = '/reclamation';
  }
}
