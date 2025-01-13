import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

/**
 * Guard to check if user is authenticated before entering a page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isAuthenticated()) {    //checks if is logged in.
    return true;
  }
  
  router.navigate(['/login'])             //redirects to login if false.
  return false;
};
