
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/AuthService.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expired-modal',
  templateUrl: './session-expired-modal.component.html',
  styleUrl: './session-expired-modal.component.scss'
})
export class SessionExpiredModalComponent {

  constructor(public activeModal: NgbActiveModal, private authService: AuthService, private router:Router) { }

  closeModal(): void {
    this.activeModal.close(); // Método para cerrar el modal manualmente
  }

  onLoginRedirect(): void {
    this.router.navigate(['/login']); // Cerrar el modal después de la acción
  }
}
