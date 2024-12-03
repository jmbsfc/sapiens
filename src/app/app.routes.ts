import { Routes } from '@angular/router';
import { PerfilComponent } from './components/perfil/perfil.component';
import { OportunidadesComponent } from './components/oportunidades/oportunidades.component';

export const routes: Routes = [
    {path:'perfil', component: PerfilComponent},
    {path:'oportunidades', component: OportunidadesComponent}
];
