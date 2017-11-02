import {Component} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {AngularFireDatabase} from "angularfire2/database";
import {EmailService} from "../../services/email.service";

@Component({
    selector: 'email-popup',
    styles: [
        `
              
        `
    ],
    template: `

            <div ngbModalContainer>
                <div class="modal-body" style="padding:8%;padding-bottom:30px;" >
            
                    <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()" style="margin:15px 3px;"><span aria-hidden="true">×</span></button>
            
                    <h3 class="line">
                        Email {{ emailService.toName }}
                    </h3>
            
                    <div style="color:#767676;padding-bottom:1rem;" class="row">
                        <div class="col-sm-3">
                            <label style="position:relative;top:4px;">To</label>
                        </div>
                        <div class="col-sm-9"> 
                            <input disabled [ngModel]="emailService.toEmail" class="form-control" />
                        </div>
                    </div>
            
                    <direct-email></direct-email>
                </div>
            </div>
                
    `
})
export class EmailPopupComponent {

    constructor(private af: AngularFireDatabase,
                public activeModal: NgbActiveModal,
                public emailService: EmailService) {

    }

}

