import { Component } from '@angular/core';
import { Modal } from 'bootstrap';
import { CandidaturesService } from '../../core/services/candidatures.service';

@Component({
  selector: 'app-candidatures',
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.scss']
})
export class CandidaturesComponent {

  public candidatures: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 9;
  public totalPages: number[] = [];
  public paginatedCandidatures: any[] = [];
  private markerToDelete: any;
  public userId: string = '';

  constructor(private candidaturesService: CandidaturesService) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('usuarioId') || '';
    if (this.userId) {
      this.loadCandidaturesByUser(this.userId);
    } else {
      console.error('No user ID found in localStorage.');
    }
  }

  public goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateCandidatures(); // Actualiza la lista de favoritos paginada
    }
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.paginateCandidatures(); // Actualiza la lista de favoritos paginada
    }
  }

  loadCandidaturesByUser(userId: string): void {
    this.candidaturesService.getCandidaturesByIdUser(userId).subscribe({
      next: (response) => {
        this.candidatures = response; // Almacena las candidaturas obtenidas
        this.paginateCandidatures(); // Realiza la paginación
      },
      error: (err) => {
        console.error('Error loading candidatures:', err);
      }
    });
  }

  removeCandidature(marker: any): void {
    this.markerToDelete = marker;
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (confirmDeleteModal) {
      const modalInstance = new Modal(confirmDeleteModal); // Crear instancia del modal
      modalInstance.show();
    }
  }

  paginateCandidatures(): void {
    this.totalPages = Array(Math.ceil(this.candidatures.length / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCandidatures = this.candidatures.slice(startIndex, endIndex);
  }

  confirmRemove(): void {
    this.candidatures = this.candidatures.filter(marker => marker !== this.markerToDelete);
    this.paginateCandidatures();
  }
}
