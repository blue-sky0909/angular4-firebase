import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, AfterContentInit} from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized} from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {ManagePromotionsService} from "../../../shared-module/services/manage-promotions.service";

@Component({
    template: `
        <div class="row"> 
            <div 
            manage-card 
            class="col-sm-6" 
            *ngFor="let event of promotions" 
            [eventId]="event.$key" 
            [eventType]="'promotedLive'"></div>
        </div>
    `,
    styles: [

    ]
})

export class PromotedLiveComponent{
    promotions:any[] = [];
    constructor(
        private auth: AuthService,
        private router: Router,
        public promotionsService: ManagePromotionsService
    ) {
        this.promotionsService.myPromotions$.subscribe(
            data => {
                for(let i = 0; i < data.length; i++){
                    if(!data[i].status){
                        this.promotions.push(data[i]);
                    } 
                }
            }
        )
    }

}
