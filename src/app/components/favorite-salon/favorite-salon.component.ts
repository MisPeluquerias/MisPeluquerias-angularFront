import { Component, OnInit } from '@angular/core';
import { FavoriteSalonService } from '../../core/services/favorite-salon.service';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-favorite-salon',
  templateUrl: './favorite-salon.component.html',
  styleUrls: ['./favorite-salon.component.scss']
})
export class FavoriteSalonComponent implements OnInit {
  favorites: any[] = []; // Propiedad para almacenar los favoritos
  paginatedFavorites: any[] = []; // Propiedad para almacenar los favoritos de la página actual
  userId: string = '';
  public currentPage: number = 1;
  public itemsPerPage: number = 9; // Número de elementos por página
  public totalPages: number[] = [];
  private markerToDelete: any; // Array para manejar el número total de páginas

  constructor(private favoriteSalonService: FavoriteSalonService, private router: Router) {}

  ngOnInit(): void {
    // Suponiendo que el ID del usuario está almacenado en localStorage
    this.userId = localStorage.getItem('usuarioId') || '';

    if (this.userId) {
      this.loadFavorites(this.userId);
    } else {
      console.error('User ID not found.');
    }
  }
  

  loadFavorites(userId: string): void {
    this.favoriteSalonService.getFavorites(userId).subscribe(
      (favorites: any[]) => {
        this.favorites = favorites;
        this.paginateFavorites();
        //console.log('Loaded favorites:', this.favorites);
      },
      (error) => {
        console.error('Error loading favorites:', error);
      }
    );
  }

  paginateFavorites(): void {
    this.totalPages = Array(Math.ceil(this.favorites.length / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedFavorites = this.favorites.slice(startIndex, endIndex);
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.paginateFavorites(); // Actualiza la lista de favoritos paginada
    }
  }

  public goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateFavorites(); // Actualiza la lista de favoritos paginada
    }
  }

  public viewDetails(id: any): void {
    if (id) {
      this.router.navigate(['/details-business', id]);
    } else {
      console.error('Marker ID is undefined');
    }
  }
  

  removeFavorite(marker: any): void {
    this.markerToDelete = marker;
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (confirmDeleteModal) {
        const modalInstance = new Modal(confirmDeleteModal); // Crear instancia del modal
        modalInstance.show();
    }
  }

  // Método para confirmar la eliminación
  confirmRemove(): void {
    if (this.markerToDelete) {
      const id_user_favorite = this.markerToDelete.id_user_favourite;
      
      if (!id_user_favorite) {
          console.error('Cannot remove favorite: id_user_favorite is not defined');
          return;
      }

      this.favoriteSalonService.removeFavorite(id_user_favorite).subscribe(
        () => {
          this.markerToDelete.isFavorite = false;
          this.markerToDelete.id_user_favorite = null;
          this.loadFavorites(this.userId);
          this.markerToDelete = null;
          //console.log('Favorite removed successfully');
        },
        error => {
          console.error('Error removing favorite', error);
        }
      );
    }
  }
}
