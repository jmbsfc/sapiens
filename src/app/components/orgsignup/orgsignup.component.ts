import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orgsignup',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './orgsignup.component.html',
  styleUrl: './orgsignup.component.css'
})
export class OrgsignupComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private imageService: ImageService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Initialize component
    console.log('Organization signup component initialized');
  }
  
  step: number = 1;
  formData: any = {
    name: '',
    website: '',
    email: '',
    password: '',
    imageUrl: null,
    phoneNumber: '',
    address: '',
  };
  
  errorMessage: string = '';
  isSubmitting: boolean = false;
  formErrors: any = {
    email: '',
    password: '',
    name: '',
    website: '',
    phoneNumber: '',
    address: ''
  };

  nextStep() {
    // Reset error messages
    this.errorMessage = '';
    this.formErrors = {
      email: '',
      password: '',
      name: '',
      website: '',
      phoneNumber: '',
      address: ''
    };
    
    // Validate first step
    if (this.step === 1) {
      if (!this.formData.email) {
        this.formErrors.email = 'Email é obrigatório';
        return;
      }
      
      if (!this.validateEmail(this.formData.email)) {
        this.formErrors.email = 'Email inválido';
        return;
      }
      
      if (!this.formData.password) {
        this.formErrors.password = 'Password é obrigatória';
        return;
      }
      
      if (this.formData.password.length < 6) {
        this.formErrors.password = 'Password deve ter pelo menos 6 caracteres';
        return;
      }
    }
    
    if (this.step < 2) {
      this.step++;
    }
  }

  prevStep() {
    // Reset error messages
    this.errorMessage = '';
    
    if (this.step > 1) {
      this.step--;
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.profilePicture = file;
    }
  }
  
  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  validateForm(): boolean {
    // Reset error messages
    this.errorMessage = '';
    this.formErrors = {
      email: '',
      password: '',
      name: '',
      website: '',
      phoneNumber: '',
      address: ''
    };
    
    let isValid = true;
    
    // Validate required fields
    if (!this.formData.name) {
      this.formErrors.name = 'Nome da organização é obrigatório';
      isValid = false;
    }
    
    if (!this.formData.phoneNumber) {
      this.formErrors.phoneNumber = 'Telefone é obrigatório';
      isValid = false;
    }
    
    if (!this.formData.address) {
      this.formErrors.address = 'Endereço é obrigatório';
      isValid = false;
    }
    
    // Website is optional but if provided, validate format
    if (this.formData.website && !this.validateWebsite(this.formData.website)) {
      this.formErrors.website = 'Formato de website inválido';
      isValid = false;
    }
    
    return isValid;
  }
  
  validateWebsite(website: string): boolean {
    // Simple website validation
    const re = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/;
    return re.test(website);
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    console.log('Form Data:', this.formData);

    try {
      // If there's a profile picture, upload it first
      if (this.formData.profilePicture && this.formData.profilePicture !== null) {
        this.uploadProfilePicture();
      } else {
        // Otherwise proceed with signup using default image
        this.completeSignup("n");
      }
    } catch (error) {
      this.isSubmitting = false;
      this.errorMessage = 'Ocorreu um erro ao processar o formulário. Por favor, tente novamente.';
      console.error('Form submission error:', error);
    }
  }
  
  uploadProfilePicture() {
    console.log('Uploading organization profile picture...');
    this.imageService.uploadImage(this.formData.profilePicture).subscribe(
      (response) => {
        console.log('Image upload successful:', response);
        if (response && response.data) {
          // The response.data contains the full path like "/images/filename.jpg"
          // Extract just the filename if needed or use the full path
          const imagePath = response.data;
          console.log('Image path received:', imagePath);
          // Complete signup with the image path
          this.completeSignup(imagePath);
        } else {
          // If image upload fails, use default image
          console.warn('Image upload response missing data, using default image');
          this.completeSignup("n");
        }
      },
      (error) => {
        console.error('Error uploading image:', error);
        // If image upload fails, continue with signup using default image
        this.completeSignup("n");
      }
    );
  }
  
  completeSignup(imagePath: string) {
    console.log('Completing organization signup with image path:', imagePath);
    this.authService.orgsignup({
      name: this.formData.name,
      website: this.formData.website,
      email: this.formData.email,
      password: this.formData.password,
      imageUrl: imagePath,
      phoneNumber: this.formData.phoneNumber,
      address: this.formData.address,
    },
    // Success callback
    () => {
      this.isSubmitting = false;
      this.router.navigate(['/login']);
    },
    // Error callback
    (error: any) => {
      this.isSubmitting = false;
      if (error.status === 400) {
        this.errorMessage = 'Dados inválidos. Por favor, verifique as informações fornecidas.';
      } else if (error.status === 409) {
        this.errorMessage = 'Este email já está em uso. Por favor, use outro email.';
      } else {
        this.errorMessage = 'Ocorreu um erro ao criar a conta. Por favor, tente novamente mais tarde.';
      }
      console.error('Organization signup error:', error);
    });
  }
}
