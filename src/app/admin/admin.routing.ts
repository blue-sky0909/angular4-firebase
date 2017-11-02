import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from "./components/admin.component";

const routes: Routes = [
  {path: '', component: AdminComponent},
];

export const adminRouting: ModuleWithProviders = RouterModule.forChild(routes);
