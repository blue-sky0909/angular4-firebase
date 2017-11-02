import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, OnInit} from '@angular/core';
import {EventService} from '../../../shared-module/services/event-service';
import {AngularFireDatabase} from 'angularfire2/database';
declare var Quill: any;

@Component({
    selector: 'my-event-registration-form',
    template: `
        <h3 class="line" style="margin-bottom:0px;">
            {{ eventService.event.title }} - Registration Form
        </h3>

        <manage-fields></manage-fields>

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

export class MyEventRegistrationFormComponent implements OnInit{

    constructor(private af: AngularFireDatabase, public eventService: EventService) {

    }

    ngOnInit(){

    }
}
