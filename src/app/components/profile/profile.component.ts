import { Component } from '@angular/core';
import { ProfileService } from '../../core/services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})



export class ProfileComponent {
  userData: any = {};
  id_user: string = '';
  errorMessage: string = '';
  cities: any[] = [];
  provinces: any[] = [];
  confirmPassword: string = '';
  password: string = '';
  isConfirmed: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private profileService: ProfileService,private toastr:ToastrService,private router:Router) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('usuarioId');
    if (userId) {
      this.id_user = userId;
      this.userData.id_city = '';
      this.getDataUser();

    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }


  getDataUser(): void {
    this.profileService.getDataUser(this.id_user).subscribe(
      (data) => {
        if (Array.isArray(data.data) && data.data.length > 0) {
          this.userData = data.data[0];
          if (!this.userData.id_city) {
            this.userData.id_city = '';
          }

          if (this.userData.id_province) {
            this.loadCities(this.userData.id_province, true);
          }
          this.loadProvinces();
        }
      },
      (error) => {
        this.errorMessage = 'Error fetching user data';
        console.error('Error fetching user data:', error);
      }
    );
  }

  loadProvinces(): void {
    this.profileService.getProvinces().subscribe(
      (response: any) => {
        this.provinces = response.data;
        if (this.provinces.length > 0) {
          if (!this.userData.id_province) {
            this.userData.id_province = this.provinces[0].id_province;
            this.loadCities(this.userData.id_province); // Cargar ciudades de la primera provincia
          }
        }
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }

  loadCities(provinceId: number, initialLoad: boolean = false): void {
    this.profileService.getCitiesByProvince(provinceId).subscribe(
      (response: any) => {
        this.cities = response.data;
        if (this.cities.length > 0) {
          if (initialLoad && this.userData.id_city !== '') {
            const selectedCity = this.cities.find(city => city.id_city === this.userData.id_city);
            if (selectedCity) {
              this.userData.city_name = selectedCity.city_name;
            }
          } else {
            this.userData.id_city = this.cities[0].id_city;
            this.userData.city_name = this.cities[0].city_name;
          }
        }
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }

  onProvinceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const provinceId = Number(target.value);
    if (provinceId) {
      this.loadCities(provinceId);
      this.userData.id_city = '';  // Resetear a "Seleccione una ciudad..." cuando cambia la provincia
    } else {
      this.cities = [];  // Vaciar las ciudades si no hay provincia seleccionada
    }
  }

  onCityChange(cityId: number): void {
    const selectedCity = this.cities.find((city) => city.id_city === cityId);
    if (selectedCity) {
      this.userData.city_name = selectedCity.city_name;
      this.userData.id_city = selectedCity.id_city;
    }
  }

  UpdateUserData(): void {
    console.log('Saving user data:', this.userData);  // Imprime los datos del usuario a guardar
    this.profileService.updateUserData(this.userData).subscribe(
      (response) => {
        this.toastr.success('<i class="las la-info-circle"> Datos actulizados con éxito</i>');
        console.log('User data saved successfully:', response);  // Muestra la respuesta exitosa
        // Aquí puedes redirigir o mostrar un mensaje de éxito al usuario
      },
      (error) => {
        console.error('Error saving user data:', error);  // Muestra el error si la solicitud falla
        this.errorMessage = 'Error saving user data';
        this.toastr.error('<i class="las la-info-circle"> No se pudieron actualizar los datos</i>');
      }
    );
  }
  changePassword(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.toastr.error('<i class="las la-info-circle"> Las contraseñas no coinciden</i>'); // Mostrar mensaje de error (opcional)
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      this.toastr.error('<i class="las la-info-circle"> La contraseña debe tener al menos 6 caracteres</i>'); // Mostrar mensaje de error (opcional)
      return;
    }
    console.log(this.userData.id_user);

    // Si las contraseñas coinciden, procede a cambiarlas
    this.profileService.updateUserPassword(this.userData.id_user, this.password).subscribe(
      response => {
        console.log('Contraseña cambiada exitosamente', response);
        this.toastr.success('<i class="las la-info-circle"> Contraseña actualizada con éxito</i>');// Mostrar mensaje de éxito (opcional)
        this.password = '';
        this.confirmPassword = '';
      },
      error => {
        console.error('Error al cambiar la contraseña', error);
        this.toastr.error('<i class="las la-info-circle"> Error al cambiar la contraseña</i>');
        //console.log(this.userData.id_user);
      }
    );
  }


  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      // Validar tamaño máximo de 800 KB
      const maxSize = 800 * 1024;
      if (file.size > maxSize) {
        this.toastr.error('El archivo excede el tamaño máximo permitido de 800 KB.');
        return;
      }

      // Validar el formato del archivo
      const validFormats = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validFormats.includes(file.type)) {
        this.toastr.error('Formato de archivo no válido. Solo se permiten JPG, GIF o PNG.');
        return;
      }

      // Si pasa las validaciones, puedes continuar con la lógica de subida de imagen
      this.uploadProfilePicture(file);
    }
  }

  uploadProfilePicture(file: File): void {
    const formData = new FormData();
    formData.append('profilePicture', file);

    this.profileService.uploadProfilePicture(this.userData.id_user, formData).subscribe(
      response => {
        this.toastr.success('Foto de perfil actualizada exitosamente.');
        // Actualizar la foto de perfil en la interfaz del usuario
        this.userData.profilePicture = response.imageUrl;
        window.location.reload();// Asegúrate de que la respuesta contiene la URL de la imagen
      },
      error => {
        console.error('Error al subir la foto de perfil', error);
        this.toastr.error('Error al subir la foto de perfil.');
      }
    );
  }

  desactivateAccount(userId:string): void {
    if (this.isConfirmed) {
      this.profileService.desactivateAccount(userId).subscribe({
        next: (response) => {
          console.log('Cuenta desactivada con éxito', response);
          // Redirigir o actualizar la UI según lo necesario
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al desactivar la cuenta', error);
        }
      });
    }
  }
}
