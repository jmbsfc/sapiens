import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, NgIf] // Importa FormsModule diretamente no componente
})
export class SignupComponent {

  constructor(private authService: AuthService) {}

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

  nextStep() {
    if (this.step < 2) {
      this.step++;
    }
  }

  prevStep() {
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

  onSubmit() {
    console.log('Form Data:', this.formData);

    this.authService.signup({
      firstName: this.formData.firstname,
      lastName: this.formData.lastname,
      email: this.formData.email,
      password: this.formData.password,
      imageUrl: "n",
      phoneNumber: this.formData.phoneNumber,
      civilId: this.formData.civilId,
      birthday: this.formData.birthdate,
      role: "VOLUNTEER",
    })

    // Adicionar logica 
  }
}