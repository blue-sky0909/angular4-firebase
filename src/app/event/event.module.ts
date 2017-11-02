import { getRegisterLoginComponent } from './../shared-module/modals/event/modals/get-register-login.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from "./components/event/event-component";
import {EventService} from "../shared-module/services/event-service";
import {AgmCoreModule} from "@agm/core";
import {PromoteModalComponent} from "../shared-module/modals/event/modals/promote-modal-component";
import {AttendModalComponent} from "../shared-module/modals/event/modals/attend-modal-component";
import {TruncatePipe} from "./pipes/truncate-pipe";
import {KeysPipe} from "./pipes/values-pipe";
import {MyEventComponent} from "./components/my-event/my-event-component";
import {MyEventAttendeesComponent} from "./components/my-event/attendees-component";
import {MyEventPromotersComponent} from "./components/my-event/promoters-component";
import {MyEventDetailsComponent} from "./components/my-event/detail-component";
import {PromoterDetail} from "./components/my-event/_promoter.detail.component";
import {InviteComponent} from "../shared-module/components/invite/invite-component";
import {RegistrationComponent} from "./components/registration/registration-component";
import {SingleRegistrationComponent} from "./components/registration/ticket-registration.component";
import {AttendeeComponent} from "./components/event/attender.component";
import {RegistrantComponent} from "./components/my-event/_registrant.detail.component";
import {BooleanByPropertyPipe} from "./pipes/boolean-by-property.pipe";
import {SharedModule} from "../shared-module/shared.module";
import {CustomInputTextComponent} from "../shared-module/components/custom-inputs/custom-input-text.component";
import {CustomInputSelectComponent} from "../shared-module/components/custom-inputs/custom-input-select.component";
import {CustomInputCheckboxComponent} from "../shared-module/components/custom-inputs/custom-input-checkbox.component";
import {NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {MyEventConfirmationComponent} from "./components/my-event/confirmation.component";
import {MyEventRegistrationFormComponent} from "./components/my-event/registration-form.component";
import {MyEventRegistrationTypesComponent} from "./components/my-event/registration-type.component";
import {MyEventRefundsComponent} from "./components/my-event/refunds.component";
import {MyEventInvitationsComponent} from "./components/my-event/invitations.component";
import {MyEventSendEmailComponent} from "./components/my-event/send-email.component";
import {MyEventScheduledEmailsComponent} from "./components/my-event/scheduled-emails.component";
import {MyEventSentEmailsComponent} from "./components/my-event/sent-messages.component";
import {ChangeStatusModalComponent} from "./components/my-event/change-status.component";
import {CreateAdvancedService} from "../create/components/advanced/services/advanced.service";
import {ManageAdvancedFieldsComponent} from "./components/my-event/createComponents/fields.component";
import {ManageAdvancedEmailComponent} from "./components/my-event/createComponents/email.component";
import {ManageAdvancedConfirmationComponent} from "./components/my-event/createComponents/confirmation.component";
import {EmailPopupComponent} from "../shared-module/components/email/email-popup.component";
import {RegistrationNewComponent} from "./components/registration/registration-new.component";
import {RegistrationTypeDetailComponent} from "./components/my-event/_registration-type.detail.component";
import {SearchOcodeComponent} from "./components/registration/search-ocode.component";
import {RegistrationConfirmationComponent} from "./components/registration/registration-confirmation.component";
import {AddEmailsModalComponent} from "./components/my-event/invitations/add-emails-modal.component";
import {UpdateEmailModalComponent} from "./components/my-event/invitations/update-email-modal.component";
import {AttendeeModalComponent} from "./components/my-event/attendee-modal.component";
import {InvitationTemplateModalComponent} from "./components/my-event/invitation-template-modal.component";
import {AuthGuard} from "../auth/guards/auth-guard";
import {UiSwitchModule} from 'ngx-toggle-switch/src';
import {ManageAdvancedEmailPromoterComponent} from './components/my-event/createComponents/email-promoter.component';
import {ManageAdvancedEmailRegistrantComponent} from './components/my-event/createComponents/email-registrant.component';
import {ManageAdvancedEmailReminderComponent} from './components/my-event/createComponents/email-reminder.component';
import {ManageAdvancedEmailCompletionComponent} from './components/my-event/createComponents/email.completion';

const routes: Routes = [
    {path: ':id', component: EventComponent},
    {path: 'register/:id', component: RegistrationComponent},
    {path: 'registernew/:id', component: RegistrationNewComponent},
    {path: 'registerconfirm/:id', component: RegistrationConfirmationComponent},
    {
        path: 'my-event/:id',
        component: MyEventComponent,
        canActivate: [AuthGuard],
        children:[
            {path: '', component: MyEventDetailsComponent},
            {path: 'details', component: MyEventDetailsComponent},
            {path: 'promoters', component: MyEventPromotersComponent},
            {path: 'attendees',component: MyEventAttendeesComponent},
            {path: 'form',component: MyEventRegistrationFormComponent},
            {path: 'confirmation',component: MyEventConfirmationComponent},
            {path: 'registration',component: MyEventRegistrationTypesComponent},
            {path: 'refunds',component: MyEventRefundsComponent},
            {path: 'invitations',component: MyEventInvitationsComponent},
            {path: 'send-email',component: MyEventSendEmailComponent},
            {path: 'emails',component: MyEventScheduledEmailsComponent},
            {path: 'sent',component: MyEventSentEmailsComponent},
        ]
    }
];

@NgModule({
    declarations: [
        AddEmailsModalComponent,
        UpdateEmailModalComponent,
        EventComponent,
        MyEventComponent,
        MyEventDetailsComponent,
        MyEventPromotersComponent,
        MyEventAttendeesComponent,
        TruncatePipe,
        KeysPipe,
        PromoterDetail,
        RegistrationComponent,
        RegistrationNewComponent,
        RegistrationConfirmationComponent,
        SearchOcodeComponent,
        SingleRegistrationComponent,
        AttendeeComponent,
        RegistrantComponent,
        BooleanByPropertyPipe,
        CustomInputTextComponent,
        CustomInputSelectComponent,
        CustomInputCheckboxComponent,
        MyEventConfirmationComponent,
        MyEventRegistrationFormComponent,
        MyEventRegistrationTypesComponent,
        RegistrationTypeDetailComponent,
        MyEventRefundsComponent,
        MyEventInvitationsComponent,
        MyEventSendEmailComponent,
        MyEventScheduledEmailsComponent,
        MyEventSentEmailsComponent,
        ChangeStatusModalComponent,
        ManageAdvancedFieldsComponent,
        ManageAdvancedConfirmationComponent,
        ManageAdvancedEmailComponent,
        AttendeeModalComponent,
        InvitationTemplateModalComponent,

        ManageAdvancedEmailPromoterComponent,
      ManageAdvancedEmailRegistrantComponent,
      ManageAdvancedEmailReminderComponent,
      ManageAdvancedEmailCompletionComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([]),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDz9UIddlXqbhsG1K2wz22MsxqkPNWfQJ8'
        }),
        NgbDatepickerModule,
        UiSwitchModule,
        SharedModule
    ],
    entryComponents: [
        ChangeStatusModalComponent,
        EmailPopupComponent,
        ChangeStatusModalComponent,
        SearchOcodeComponent,
        AddEmailsModalComponent,
        UpdateEmailModalComponent,
        AttendeeModalComponent,
        InvitationTemplateModalComponent,
        getRegisterLoginComponent
    ],
    providers: [
        CreateAdvancedService
    ],
    exports: [
      AddEmailsModalComponent,
      UpdateEmailModalComponent,
      EventComponent,
      MyEventComponent,
      MyEventDetailsComponent,
      MyEventPromotersComponent,
      MyEventAttendeesComponent,
      TruncatePipe,
      KeysPipe,
      PromoterDetail,
      RegistrationComponent,
      RegistrationNewComponent,
      RegistrationConfirmationComponent,
      SearchOcodeComponent,
      SingleRegistrationComponent,
      AttendeeComponent,
      RegistrantComponent,
      BooleanByPropertyPipe,
      CustomInputTextComponent,
      CustomInputSelectComponent,
      CustomInputCheckboxComponent,
      MyEventConfirmationComponent,
      MyEventRegistrationFormComponent,
      MyEventRegistrationTypesComponent,
      RegistrationTypeDetailComponent,
      MyEventRefundsComponent,
      MyEventInvitationsComponent,
      MyEventSendEmailComponent,
      MyEventScheduledEmailsComponent,
      MyEventSentEmailsComponent,
      ChangeStatusModalComponent,
      ManageAdvancedFieldsComponent,
      ManageAdvancedConfirmationComponent,
      ManageAdvancedEmailComponent,
      AttendeeModalComponent,
      InvitationTemplateModalComponent
    ]



})

export class EventModule {}

export { };
