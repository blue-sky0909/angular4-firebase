import { PreviewService } from './create/services/preview.service';
import { CreateAdvancedService } from './create/components/advanced/services/advanced.service';
import { CreateTicketsService } from './create/services/create-tickets.service';
import { CreateEventDateService } from './create/services/create-date.service';
import { CreateEventService } from './create/services/create-event.service';
import { getSaveChangesComponent } from './create/components/edit/modal/saveChanges-modal.component';
import {NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FirebaseModule } from '../firebase';

import { AppComponent } from './app-components/app.component';
import { AppHeaderComponent } from './app-components/app-header';

import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SignInComponent} from "./shared-module/components/sign-in/sign-in";
import {FormsModule} from "@angular/forms";
import {AppService} from "./services/app-service";
import {JoinComponent} from "./shared-module/components/join/join";
import {SlimLoadingBarModule} from "ng2-slim-loading-bar/index";
import {ToastyModule} from "ng2-toasty/index";
import { Ng2ImgToolsModule } from 'ng2-img-tools';
import {ProfileModule} from "./profile/profile.module";
import {OCodeService} from "./services/ocode-service";
import {FreeTrialModalComponent} from "./app-components/free-trial-modal";
import {TopBarReminderComponent} from "./app-components/controls/top-bar-reminder.component";
import {ForgotPasswordComponent} from "./app-components/forgot-password.component";
import {CreateModule} from './create/create.module';

import {SwiperModule, SwiperConfigInterface} from "ngx-swiper-wrapper";
import {NeedOcodeComponent} from "./shared-module/components/need-ocode/need-ocode";
import {HttpModule} from "@angular/http";
import {SharedModule} from "./shared-module/shared.module";
import {AuthModule} from "./auth/auth.module";
import {Routes, RouterModule} from "@angular/router";
import {CropModalComponent} from "./shared-module/components/crop-modal/crop-modal.component";
import { ProfileComponent } from "./profile/components/profile-component";
import {UnauthGuard} from "./auth/guards/unauth-guard";
import {AuthGuard} from "./auth/guards/auth-guard";
import {PromoteModalComponent} from "./shared-module/modals/event/modals/promote-modal-component";
import {AttendModalComponent} from "./shared-module/modals/event/modals/attend-modal-component";
import {EventModule} from "./event/event.module";
import {EventComponent} from "./event/components/event/event-component";
import {RegistrationComponent} from "./event/components/registration/registration-component";
import {MyEventComponent} from "./event/components/my-event/my-event-component";
import {MyEventAttendeesComponent} from "./event/components/my-event/attendees-component";
import {MyEventPromotersComponent} from "./event/components/my-event/promoters-component";
import {MyEventDetailsComponent} from "./event/components/my-event/detail-component";
import {MyEventConfirmationComponent} from "./event/components/my-event/confirmation.component";
import {MyEventRegistrationFormComponent} from "./event/components/my-event/registration-form.component";
import {MyEventRegistrationTypesComponent} from "./event/components/my-event/registration-type.component";
import {MyEventRefundsComponent} from "./event/components/my-event/refunds.component";
import {MyEventInvitationsComponent} from "./event/components/my-event/invitations.component";
import {MyEventSendEmailComponent} from "./event/components/my-event/send-email.component";
import {MyEventScheduledEmailsComponent} from "./event/components/my-event/scheduled-emails.component";
import {MyEventSentEmailsComponent} from "./event/components/my-event/sent-messages.component";
import {RegistrationNewComponent} from "./event/components/registration/registration-new.component";
import {RegistrationConfirmationComponent} from "./event/components/registration/registration-confirmation.component";
import {AngularFireModule} from 'angularfire2';
import { environment } from '../environments/environment';
import 'firebase/storage';

const ROUTES: Routes = [

  { path: '', loadChildren: './landing/landing.module#LandingModule', canActivate: [UnauthGuard] },
  { path: 'create', loadChildren: './create/create.module#CreateModule', canActivate: [AuthGuard] },
  { path: 'search', loadChildren: './search/search.module#SearchModule', canActivate: [AuthGuard] },
  { path: 'notifications', loadChildren: './notifications/notifications.module#NotificationsModule', canActivate: [AuthGuard] },
  { path: 'marketing', loadChildren: './marketing/marketing.module#MarketingModule', canActivate: [AuthGuard] },
  { path: 'manage', loadChildren: './manage/manage.module#ManageModule', canActivate: [AuthGuard] },
  { path: 'login', loadChildren: './login/login.module#LoginModule', canActivate: [UnauthGuard] },
  { path: 'home', loadChildren: './home/home.module#HomeModule', canActivate: [AuthGuard] },
  { path: 'following', loadChildren: './following/following.module#FollowingModule', canActivate: [AuthGuard] },
  { path: 'email-action', loadChildren: './email-action/email-action.module#EmailActionModule', canActivate: [AuthGuard] },
  { path: 'account', loadChildren: './account/account.module#AccountModule', canActivate: [AuthGuard] },
  { path: 'bookmarks', loadChildren: './bookmarks/bookmarks.module#BookmarkModule', canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: './admin/admin.module#AdminModule', canActivate: [AuthGuard] },

  {path: 'event/:id', component: EventComponent},
  {path: 'event/register/:id', component: RegistrationComponent},
  {path: 'event/registernew/:id', component: RegistrationNewComponent},
  {path: 'event/registerconfirm/:id', component: RegistrationConfirmationComponent},
  {
    path: 'event/my-event/:id',
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
  },

  {path: 'profile/:id', component: ProfileComponent },
  { path: '**', component: ProfileComponent },

];

//CAROUSEL ON HOME PAGE
const SWIPER_CONFIG: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    keyboardControl: true
};

@NgModule({
    bootstrap: [
        AppComponent
    ],
    providers: [
        AppService,
        OCodeService,
        CreateEventService,
        CreateEventDateService,
        CreateTicketsService,
        CreateAdvancedService,
        PreviewService
    ],
    declarations: [
        AppComponent,
        AppHeaderComponent,
        FreeTrialModalComponent,
        TopBarReminderComponent,
        ForgotPasswordComponent,
    ],
    imports: [
        FirebaseModule,
        AngularFireModule.initializeApp(environment.firebaseConfig, 'Oevent'),
        BrowserModule,
        RouterModule.forRoot(ROUTES),
        SharedModule.forRoot(),
        AuthModule,
        FormsModule,
        NgbModule.forRoot(),
        SlimLoadingBarModule.forRoot(),
        ToastyModule.forRoot(),
        Ng2ImgToolsModule,
        SwiperModule.forRoot(SWIPER_CONFIG),
        HttpModule,
        EventModule,
        ProfileModule,
    ],
    entryComponents: [
        SignInComponent,
        JoinComponent,
        FreeTrialModalComponent,
        ForgotPasswordComponent,
        SignInComponent,
        JoinComponent,
        NeedOcodeComponent,
        CropModalComponent,
        PromoteModalComponent,
        AttendModalComponent,
    ]
})

export class AppModule {}
