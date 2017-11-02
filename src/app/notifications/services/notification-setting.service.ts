import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {UserNotificationSetting} from "../models/UserNotificationSetting";
import {Observable} from "rxjs";
import {NotificationSettingEnum} from "../enum/NotificationSettingEnum";
import {AuthService} from "../../auth/services/auth-service";

@Injectable()
export class NotificationSettingService {

    constructor(private af: AngularFireDatabase, private auth: AuthService) {

    }

    public updateUserNotificationSetting(userId:string,setting:string,userNotifSetting:UserNotificationSetting):void{
        this.af.object(`/notification/settings/${userId}/${setting}`).set(userNotifSetting);
    }

    public getUserNotificationSettings(userId:string):Observable<any>{
        return this.af.object(`/notification/settings/${userId}`);
    }

    public setDefaultNoticationSettings(userId:string){
        var options = Object.keys(NotificationSettingEnum);
        var i:number = 0;
        while (i  <= options.length) {
            if(options[i] !== null) {
                let userNotificationSetting = new UserNotificationSetting();
                userNotificationSetting.inApp = true;
                if(String(options[i]) == "BID_WON_FOR_FEATURED_EVENT" ||
                    String(options[i]) == "BID_SURPASSED_FOR_FEATURED_EVENT" ||
                    String(options[i]) == "BILLING_NOTICE_EXPIRING_CREDIT_CARD"
                ){
                    userNotificationSetting.email = true;
                }
                this.updateUserNotificationSetting(userId,String(options[i]),userNotificationSetting);
            }
            i = i+2;
        }
    }

}
