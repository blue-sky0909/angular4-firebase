import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component,OnInit, AfterContentInit} from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized} from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {ManagePromotionsService} from "../../../shared-module/services/manage-promotions.service";

@Component({
    templateUrl: './history.html',
    styles: [

    ]
})

export class PromotedHistoryComponent implements OnInit{
    promotions:any[] = [];
    promoteHistory:any[] = [];
    constructor(private auth: AuthService, private router: Router, public promotionsService: ManagePromotionsService, private af:AngularFireDatabase) {
        
    }

    ngOnInit():void {
        this.promotionsService.getHistory('history').subscribe(
            data => {
                this.promotions = data;
                for(let i = 0; i < this.promotions.length; i++){
                    this.af.object('/events/history/' + this.promotions[i].$key).subscribe(
                        data => {
                            this.promoteHistory.push(data);
                        }
                    )
                }
            }
        )
    }

    // loadPromotions():void{
    //     this.promotionsService.myPromotions$
    //         .subscribe(snapshots => {
    //            this.promotions = snapshots;
    //         });
    // }


}
