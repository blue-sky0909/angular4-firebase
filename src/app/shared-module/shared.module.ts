import { CreateEventService } from './../create/services/create-event.service';
import { getRegisterLoginComponent } from './modals/event/modals/get-register-login.component';
import { CommonModule } from '@angular/common';
import {NgModule, ModuleWithProviders} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReversePipe } from './pipes/reverse.pipe';
import { ClickTargetDirective } from './directives/click-outside-directive';
import {HorizontalCardComponent} from './components/event-cards/horizontal-card.component';
import {OChipContainerComponent} from './components/chips/chip-container-component';
import {OChipComponent} from './components/chips/chip-component';
import {OPageComponent} from './components/paging/paging-component';
import {UpperCaseDirective} from './directives/uppercase-directive';
import {LowerCaseDirective} from './directives/lowercase-directive';
import {VerticalCardComponent} from './components/event-cards/vertical-card.component';
import {EventBookmarkService} from './services/event.bookmark.service';
import {StatusBarComponent} from './components/status-bar/status-bar.component';
import {EmailService} from './services/email.service';
import {EmailComponent} from './components/email/email.component';
import {EmailPopupComponent} from './components/email/email-popup.component';
import {QuickContactComponent} from './components/profile/quick-contact.component';
import {ManageInviteComponent} from './components/invite/o-invite.component';
import {ImageCropService} from './services/image-crop.service';
import {CropModalComponent} from './components/crop-modal/crop-modal.component';
import {ImageCropperModule} from 'ng2-img-cropper';
import {JoinComponent} from './components/join/join';
import {SignInComponent} from './components/sign-in/sign-in';
import {TimezoneSelectComponent} from './components/timezone-select/timezone-select.component';
import {NeedOcodeComponent} from './components/need-ocode/need-ocode';
import {SetOcodeComponent} from './components/set-ocode/set-ocode.component';
import {NotificationItemComponent} from '../notifications/components/notification-item.component';
import {AccountContactService} from './services/account-contact-service';
import {InappNotificationService} from './services/inapp-notification.service';
import {SearchService} from './services/search-service';
import {AccountMeService} from './services/account-me-service';
import {BookmarkService} from './services/bookmark.service';
import {ManagePromotionsService} from './services/manage-promotions.service';
import {ManageService} from './services/manage-service';
import {FollowingService} from './services/following.service';
import {EventService} from './services/event-service';
import {PromoteModalComponent} from './modals/event/modals/promote-modal-component';
import {AttendModalComponent} from './modals/event/modals/attend-modal-component';
import {InviteComponent} from './components/invite/invite-component';
import {PropayService} from './services/propay.service';

@NgModule({
    declarations: [
        ReversePipe,
        ClickTargetDirective,
        HorizontalCardComponent,
        VerticalCardComponent,
        OChipContainerComponent,
        OChipComponent,
        OPageComponent,
        UpperCaseDirective,
        LowerCaseDirective,
        StatusBarComponent,
        EmailPopupComponent,
        EmailComponent,
        StatusBarComponent,
        NotificationItemComponent,
        QuickContactComponent,
        ManageInviteComponent,
        InviteComponent,
        CropModalComponent,
        SignInComponent,
        JoinComponent,
        TimezoneSelectComponent,
        NeedOcodeComponent,
        SetOcodeComponent,
        PromoteModalComponent,
        AttendModalComponent,
        getRegisterLoginComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ImageCropperModule,
    ],
    providers: [
        EventBookmarkService,
        EmailService,
        AccountContactService,
        AccountMeService,
        InappNotificationService,
        SearchService,
        BookmarkService,
        ManagePromotionsService,
        ManageService,
        FollowingService,
        EventService,
        PropayService,
    ],
    exports: [
        ReversePipe,
        ClickTargetDirective,
        HorizontalCardComponent,
        VerticalCardComponent,
        OChipContainerComponent,
        OChipComponent,
        OPageComponent,
        StatusBarComponent,
        NotificationItemComponent,
        StatusBarComponent,
        EmailPopupComponent,
        EmailComponent,
        QuickContactComponent,
        ManageInviteComponent,
        SignInComponent,
        JoinComponent,
        TimezoneSelectComponent,
        NeedOcodeComponent,
        SetOcodeComponent,
        PromoteModalComponent,
        AttendModalComponent,
        InviteComponent,
        getRegisterLoginComponent,
    ]
})

export class SharedModule {

  static forRoot(): ModuleWithProviders{
    return {
      ngModule: SharedModule,
      providers: [
        ImageCropService
      ]
    };
  }

}
