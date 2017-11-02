import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, OnInit} from '@angular/core';
import {EventService} from '../../../shared-module/services/event-service';
import {AngularFireDatabase} from 'angularfire2/database';
declare var Quill: any;

@Component({
    selector: 'my-event-scheduled-emails',
    template: `
        <h3 class="line" style="margin-bottom:0px;">
            {{ eventService.event.title }} - Scheduled Emails
        </h3>
        <manage-emails></manage-emails>
    `,
    styles: [
        `

        `
    ]

})

export class MyEventScheduledEmailsComponent implements OnInit{

    constructor(private af: AngularFireDatabase, public eventService: EventService) {

    }

    ngOnInit(){

    }
}
