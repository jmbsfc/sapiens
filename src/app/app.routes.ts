import { Routes } from '@angular/router';
import { PerfilComponent } from './components/perfil/perfil.component';
import { OportunidadesComponent } from './components/oportunidades/oportunidades.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { LandingpageComponent } from './components/landingpage/landingpage.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes: Routes = [
    {path:'', component:LandingpageComponent},
    {path:'perfil', component: PerfilComponent, canActivate: [authGuard]}, 
    {path:'oportunidades', component: OportunidadesComponent, canActivate: [authGuard]},
    {path:'login', component: LoginComponent},
    {path:'signup',component: SignupComponent}
];
