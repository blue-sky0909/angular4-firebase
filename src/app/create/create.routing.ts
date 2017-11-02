import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateComponent} from "./components/create.component";
import {AuthGuard} from "../auth/guards/auth-guard";
import {EditComponent} from "./components/edit/edit.component";
import {PreviewComponent} from "./components/preview/preview.component";
import {AdvancedComponent} from "./components/advanced/advanced.component";
import {AdvancedCompletionComponent} from "./components/advanced/views/completion.component";
import {AdvancedConfirmationComponent} from "./components/advanced/views/confirmation.component";
import {AdvancedEmailComponent} from "./components/advanced/views/email.component";
import {AdvancedFieldsComponent} from "./components/advanced/views/fields.component";
import {AdvancedPromoterComponent} from "./components/advanced/views/promoter.component";
import {AdvancedRegistrantComponent} from "./components/advanced/views/registrant.component";
import {AdvancedReminderComponent} from "./components/advanced/views/reminder.component";

const routes: Routes = [
  {path: '', component: CreateComponent},
  {
    path: ':id',
    component: CreateComponent,
    children: [
      {path: '', component: EditComponent},
      {path: 'edit', component: EditComponent},
      {path: 'preview', component: PreviewComponent},
      {
        path: 'advanced', component: AdvancedComponent, children: [
        {path: '', component: AdvancedEmailComponent},
        {path: 'completion', component: AdvancedCompletionComponent},
        {path: 'confirmation', component: AdvancedConfirmationComponent},
        {path: 'email', component: AdvancedEmailComponent},
        {path: 'fields', component: AdvancedFieldsComponent},
        {path: 'promoter', component: AdvancedPromoterComponent},
        {path: 'registrant', component: AdvancedRegistrantComponent},
        {path: 'reminder', component: AdvancedReminderComponent}
      ]
      },
    ]
  }
];

export const createRouting: ModuleWithProviders = RouterModule.forChild(routes);
