import { EventEmitter } from '@angular/core';
import {Component, AfterContentInit, OnInit, Input, Output} from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized, ActivatedRoute, Params} from '@angular/router';
import {AppService} from '../../../services/app-service';
import {AuthService} from '../../../auth/services/auth-service';
import {CreateEventService} from '../../services/create-event.service';

@Component({
    selector: 'event-type',

    template: `
        <div>
            <label>
               Event Type
            </label>
        </div>
        <div>
            <label>
                <input type="radio" [(ngModel)]="type" name="type" value="local" (click)="saveType($event)" />&nbsp; Local
            </label>
            <label style="padding-left:15px;">
                <input type="radio" [(ngModel)]="type" name="type" value="online" (click)="saveType($event)" />&nbsp; Online
            </label>
        </div>

    `,
    styles: [
        `
            :host{
                display:block;
            }
        `
    ],

})

export class EditTypeComponent implements OnInit{

    type: string = 'local';
    @Output() types = new EventEmitter();
    constructor(private auth: AuthService,
                private appService: AppService,
                private router: Router,
                private route: ActivatedRoute,
                private createService: CreateEventService) {

    }

    ngOnInit(){
        this.type = this.createService.draft.type;
        this.createService.saveChanges.subscribe(
            data => {
                if(!data){
                    this.type = this.createService.draft.type;
                }
            }
        )
    }

    saveType(event){
        this.type = event.target.value;
        this.createService.updateLocationType(this.type);
        this.types.emit(this.type);
    }


}
