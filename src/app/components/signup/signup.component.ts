import { NgIf, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, NgIf, NgClass]
})
export class SignupComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private imageService: ImageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize component
    console.log('Signup component initialized');
  }

  step: number = 1;
  formData: any = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    profilePicture: null,
    phoneNumber: '',
    civilId: '',
    birthdate: ''
  };
  
  errorMessage: string = '';
  isSubmitting: boolean = false;
  formErrors: any = {
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phoneNumber: '',
    civilId: '',
    birthdate: ''
  };

  nextStep() {
    // Reset error messages
    this.errorMessage = '';
    this.formErrors = {
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      phoneNumber: '',
      civilId: '',
      birthdate: ''
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
      firstname: '',
      lastname: '',
      phoneNumber: '',
      civilId: '',
      birthdate: ''
    };
    
    let isValid = true;
    
    // Validate required fields
    if (!this.formData.firstname) {
      this.formErrors.firstname = 'Nome é obrigatório';
      isValid = false;
    }
    
    if (!this.formData.lastname) {
      this.formErrors.lastname = 'Sobrenome é obrigatório';
      isValid = false;
    }
    
    if (!this.formData.phoneNumber) {
      this.formErrors.phoneNumber = 'Telefone é obrigatório';
      isValid = false;
    }
    
    if (!this.formData.civilId) {
      this.formErrors.civilId = 'ID Civil é obrigatório';
      isValid = false;
    }
    
    if (!this.formData.birthdate) {
      this.formErrors.birthdate = 'Data de nascimento é obrigatória';
      isValid = false;
    }
    
    return isValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    console.log('Form Data:', this.formData);

    try {
      // Format birthdate to dd-mm-yyyy as required by the database
      const formattedBirthdate = this.formatDateForServer(this.formData.birthdate);
      console.log('Formatted birthdate for server:', formattedBirthdate);
      
      // If there's a profile picture, upload it first
      if (this.formData.profilePicture && this.formData.profilePicture !== null) {
        this.uploadProfilePicture();
      } else {
        // Otherwise proceed with signup using default image
        this.completeSignup("n", formattedBirthdate);
      }
    } catch (error) {
      this.isSubmitting = false;
      this.errorMessage = 'Ocorreu um erro ao processar o formulário. Por favor, tente novamente.';
      console.error('Form submission error:', error);
    }
  }
  
  uploadProfilePicture() {
    console.log('Uploading profile picture...');
    this.imageService.uploadImage(this.formData.profilePicture).subscribe(
      (response) => {
        console.log('Image upload successful:', response);
        if (response && response.data) {
          // Format birthdate to dd-mm-yyyy as required by the database
          const formattedBirthdate = this.formatDateForServer(this.formData.birthdate);
          // The response.data contains the full path like "/images/filename.jpg"
          const imagePath = response.data;
          console.log('Image path received:', imagePath);
          // Complete signup with the image path
          this.completeSignup(imagePath, formattedBirthdate);
        } else {
          // If image upload fails, use default image
          console.warn('Image upload response missing data, using default image');
          const formattedBirthdate = this.formatDateForServer(this.formData.birthdate);
          this.completeSignup("n", formattedBirthdate);
        }
      },
      (error) => {
        console.error('Error uploading image:', error);
        // If image upload fails, continue with signup using default image
        const formattedBirthdate = this.formatDateForServer(this.formData.birthdate);
        this.completeSignup("n", formattedBirthdate);
      }
    );
  }
  
  completeSignup(imagePath: string, formattedBirthdate: string) {
    console.log('Completing signup with image path:', imagePath);
    this.authService.signup({
      firstName: this.formData.firstname,
      lastName: this.formData.lastname,
      email: this.formData.email,
      password: this.formData.password,
      imageUrl: imagePath,
      phoneNumber: this.formData.phoneNumber,
      civilId: this.formData.civilId,
      birthday: formattedBirthdate
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
      console.error('Signup error:', error);
    });
  }
  
  // Format date from HTML input (YYYY-MM-DD) to dd-mm-yyyy for the server
  formatDateForServer(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Parse the date from the input format (YYYY-MM-DD)
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Convert to dd-mm-yyyy format
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      // If the format is unexpected, try to parse and reformat
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return dateString;
      }
      
      // Format as dd-mm-yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }
}