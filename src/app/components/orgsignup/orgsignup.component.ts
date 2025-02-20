import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-orgsignup',
  imports: [FormsModule, NgIf],
  templateUrl: './orgsignup.component.html',
  styleUrl: './orgsignup.component.css'
})
export class OrgsignupComponent {

  constructor(private authService: AuthService) {}
  
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
  
      this.authService.orgsignup({
        name: this.formData.name,
        website: this.formData.website,
        email: this.formData.email,
        password: this.formData.password,
        imageUrl: "n",
        phoneNumber: this.formData.phoneNumber,
        address: this.formData.address,
      })
  
      // Adicionar logica 
    }
}
