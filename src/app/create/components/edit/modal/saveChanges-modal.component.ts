import { CreateEventService } from './../../../services/create-event.service';

import {Component, Output, EventEmitter, Input} from '@angular/core';
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'reg-join',
    styles: [
        `
            .custButtons{
                margin-top: 50px;
            }
            .custButtons .btn{
                margin-right: 10px;
            }
        `
    ],
    templateUrl: './save-changes.html'
})

export class getSaveChangesComponent{


    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal,
        private createService:CreateEventService
    ){

    }

    save(){
        this.activeModal.dismiss();
        console.log('save');
        this.createService.updateSaveChanges(true);
    }

    discard(){
        this.activeModal.dismiss();
        this.createService.updateSaveChanges(false);
        console.log('discard');
    }

}