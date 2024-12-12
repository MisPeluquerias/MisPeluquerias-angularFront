import { Component } from '@angular/core';
import { Modal } from 'bootstrap';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { ToastrService } from 'ngx-toastr';

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
  viewDetailsJob: any;
  viewDetailsCandidature:any;

  constructor(private candidaturesService: CandidaturesService,
    private toastr: ToastrService
  ) {}

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

  getFormattedSalary(): string {
    //console.log('Salario de la oferta:',this.viewDetailsJob?.salary);
    if (
      this.viewDetailsJob?.salary == null ||
      this.viewDetailsJob.salary === '0'
    ) {
      return 'Salario no disponible';
    }
    return (
      this.viewDetailsJob.salary
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'
    );
  }


  loadCandidaturesByUser(userId: string): void {
    this.candidaturesService.getCandidaturesByIdUser(userId).subscribe({
      next: (response) => {
        this.candidatures = response; // Almacena las candidaturas obtenidas
        this.paginateCandidatures(); // Realiza la paginación
        console.log('Candidatures loaded:', this.candidatures);
      },
      error: (err) => {
        console.error('Error loading candidatures:', err);
      }
    });
  }



  setToRemoveCandidature(id_user_job_subscriptions: any): void {
    this.markerToDelete = id_user_job_subscriptions;
    console.log('Marker to remove:', this.markerToDelete);
  }


  paginateCandidatures(): void {
    this.totalPages = Array(Math.ceil(this.candidatures.length / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCandidatures = this.candidatures.slice(startIndex, endIndex);
  }

  confirmRemove(): void {
    this.candidaturesService.removeCandidature(this.markerToDelete).subscribe({
      next:(response)=>{
        this.toastr.success('Candidatura eliminada con exito');
        this.loadCandidaturesByUser(this.userId);

      },
      error:(error)=>{
        console.error('Error deleting candidature',error)
        this.toastr.error('Hubo un error al eliminar la candidatura');
      }
    })
  }

  SetToViewDetailsOffer(job: any): void {
    this.viewDetailsJob = job;
  }

  SetToViewDetailsCandidature(job:any): void {
    this.viewDetailsCandidature = job;
  }
}
