import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {NotificationSettingService} from "./services/notification-setting.service";
import {NotificationsComponent} from "./components/notifications.component";
import {SharedModule} from "../shared-module/shared.module";
import {TopNotificationsService} from "./services/top-notifications.service";
import {NotificationSettingsComponent} from "./components/notification-settings.component";
import {InappNotificationService} from "../shared-module/services/inapp-notification.service";
import {NotificationItemComponent} from "./components/notification-item.component";
import {AuthGuard} from "../auth/guards/auth-guard";

const routes: Routes = [
    {path: '', component: NotificationsComponent}
];

@NgModule({

    declarations: [
        NotificationsComponent,
        NotificationSettingsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    providers: [
        NotificationSettingService,
        TopNotificationsService,

    ],
    entryComponents: [
        NotificationSettingsComponent
    ]


})

export class NotificationsModule {}

export { NotificationSettingService, TopNotificationsService };
