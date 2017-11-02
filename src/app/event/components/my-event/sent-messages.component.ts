import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, OnInit} from '@angular/core';
import {EventService} from '../../../shared-module/services/event-service';
import {AngularFireDatabase} from 'angularfire2/database';
declare var Quill: any;

@Component({
    selector: 'my-event-sent-emails',
    template: `
        <h3 class="line" style="margin-bottom:0px;">
            {{ eventService.event.title }} - Sent Emails
        </h3>
    `,
    styles: [
        `

        `
    ]

})

export class MyEventSentEmailsComponent implements OnInit{

    constructor(private af: AngularFireDatabase, public eventService: EventService) {

    }

    ngOnInit(){

    }
}
