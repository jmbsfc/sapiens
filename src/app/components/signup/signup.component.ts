import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule] // Importa FormsModule diretamente no componente
})
export class SignupComponent {
  step: number = 1;
  formData: any = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    profilePicture: null,
    phone: '',
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
    // Adicionar logica
  }
}