import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AppService} from '../../../services/app-service';
import {AuthService} from '../../../auth/services/auth-service';
import {CreateEventService} from '../../services/create-event.service';

@Component({
  selector: 'event-title',
  template:
      `
      <div class="{{!createService.isFieldValid('title')?'has-error':''}}">
        <label>
            Event Name
        </label>
        <input type="text" id="title" class="form-control" [(ngModel)]="title" (blur)="saveTitle()"/>
        <div *ngIf="!createService.isFieldValid('title')" class="validation-error-text">
          {{createService.fieldValidations.get("title").errorMessage}}
        </div>
      </div>
      `,
  styles: [
     `
        :host{
        width:100%;
        }
      `
  ],

})

export class EditTitleComponent implements OnInit {

    title: string;
    @Output() eventTitle = new EventEmitter();
    constructor(private auth: AuthService,
                private appService: AppService,
                private router: Router,
                private route: ActivatedRoute,
                public createService: CreateEventService)
    {

    }

    ngOnInit() {
        this.title = this.createService.draft.title;
        this.createService.saveChanges.subscribe(
            data => {
                if(!data){
                    this.title = this.createService.draft.title;
                }
            }
        )
    }

    saveTitle() {
        // this.createService.initValidationField('title');
        if (this.title && this.title.trim() !== '') {
        //     this.createService.draftObject$.update({'title': this.title, 'status': 'draft'})
        //         .then(() => {
        //             this.createService.showSavedDraft();
        //         });


        //   if (this.createService.isLive()){
        //     if(this.createService.validateLive())
        //         this.createService.publish();
        //     }
            this.createService.removeErrorInField('title');
            this.eventTitle.emit(this.title);
        } else {
            this.createService.setErrorInField('title', 'Event name is a required field');
        }
        
    }


}
