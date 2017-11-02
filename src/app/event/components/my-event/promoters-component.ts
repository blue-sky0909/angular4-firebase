import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, OnInit, Input} from '@angular/core';
import {EventService} from '../../../shared-module/services/event-service';
import {AngularFireDatabase} from 'angularfire2/database';
declare var Quill: any;

@Component({
    selector: 'my-event-promoters',
    template: `
        <h3 class="line" style="margin-bottom:0px;">
            {{ eventService.event.title }} - Promoters
        </h3>

        <div *ngIf="set && eventService.set" class="row">
            <div promoter-details
                class="col-sm-6"
                *ngFor="let promoter of promoters$ | async"
                [eventId]="eventId"
                [ocode]="promoter.$key"
                [datetime]="promoter.datetime"
                [registrations]="promoter.registrations"></div>
        </div>
    `,
    styles: [
        `
            .c-cart-table-title{
                border-bottom: 1px solid;
                border-color: rgba(135, 151, 174, 0.15);
            }
        `
    ]

})

export class MyEventPromotersComponent implements OnInit{

    @Input() title: string;
    eventId: string;
    promoters$: any;
    set = false;

    constructor(private af: AngularFireDatabase,
                public eventService: EventService) {

    }

    ngOnInit(){

        if (this.eventService.set){
            this.promoters$ = this.eventService.getPromoters();
            this.set = true;
        }

        else {
            this.eventService.eventUpdated.first().subscribe(() => {
                this.promoters$ = this.eventService.getPromoters();
                this.set = true;
            });
        }

    }
}
