import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  formErrors = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Initialize component
    console.log('Login component initialized');
  }

  validateForm(): boolean {
    // Reset error messages
    this.errorMessage = '';
    this.formErrors = {
      email: '',
      password: ''
    };
    
    let isValid = true;
    
    // Validate email
    if (!this.email) {
      this.formErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!this.validateEmail(this.email)) {
      this.formErrors.email = 'Email inválido';
      isValid = false;
    }
    
    // Validate password
    if (!this.password) {
      this.formErrors.password = 'Password é obrigatória';
      isValid = false;
    }
    
    return isValid;
  }
  
  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  onLogin() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    console.log({email: this.email, password: this.password});
    
    try {
      this.authService.login(
        { email: this.email, password: this.password },
        // Success callback
        () => {
          this.isSubmitting = false;
          this.router.navigate(['/']);
        },
        // Error callback
        (error) => {
          this.isSubmitting = false;
          if (error.status === 401) {
            this.errorMessage = 'Email ou password incorretos. Por favor, tente novamente.';
          } else if (error.status === 404) {
            this.errorMessage = 'Conta não encontrada. Verifique seu email ou crie uma nova conta.';
          } else {
            this.errorMessage = 'Ocorreu um erro ao fazer login. Por favor, tente novamente.';
          }
          console.error('Login error:', error);
        }
      );
    } catch (error) {
      this.isSubmitting = false;
      this.errorMessage = 'Ocorreu um erro ao processar o login. Por favor, tente novamente.';
      console.error('Login submission error:', error);
    }
  }
}
