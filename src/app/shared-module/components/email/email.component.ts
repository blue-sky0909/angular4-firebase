import {Component, OnInit, AfterViewInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AngularFireDatabase} from 'angularfire2/database';
import {EmailService} from '../../services/email.service';
import {ToastyService} from 'ng2-toasty';
import {EmailMessage} from '../../../shared-models/email-message';
import * as moment from 'moment';
import {AppService} from '../../../services/app-service';
declare var Quill: any;

@Component({
    selector: 'direct-email',
    styles: [
        `

        `
    ],
    template: `
        <div class="row">
            <div class="col-md-3">
                <label>Reply-to</label>
            </div>
            <div class="col-md-9">
                <input class="form-control" disabled [(ngModel)]="replyTo">
            </div>
        </div>
        <div style="padding-top:1rem;padding-bottom:0" class="row">
            <div class="col-md-3">
                <label>Subject</label>
            </div>
            <div class="col-md-9">
                <input class="form-control" [(ngModel)]="subject">
            </div>
        </div>
        <div>
            <label>Body</label>
            <div id="toolbar"></div>
            <div id="message" style="min-height:150px;"></div>
        </div>

        <button class="btn btn-primary btn-lg pull-right" style="margin:1rem 0;margin-bottom:3rem;" (click)="sendEmail()">Send</button>
    `
})
export class EmailComponent implements AfterViewInit, OnInit {

    subject: string;
    body: string;
    replyTo: string;
    messageQuill: any;

    constructor(private af: AngularFireDatabase,
                private appService: AppService,
                public activeModal: NgbActiveModal,
                public toasty: ToastyService,
                public emailService: EmailService) {
        this.emailService.setFromEmail().then((email) => {
            this.replyTo = email;
            console.log(email);
        });
    }

    ngOnInit() {
        this.appService.updateContactAndAbout();
    }

    ngAfterViewInit() {
        // INITIALIZE QUILL EDITOR

        this.initializeEdit();
    }

    sendEmail() {
        const pendingEmailMessage: EmailMessage = new EmailMessage();
        pendingEmailMessage.from = this.appService.contact.email;
        pendingEmailMessage.subject = this.subject;
        pendingEmailMessage.body = this.messageQuill.root.innerHTML;
        pendingEmailMessage.sendDateTime = moment().unix();
        pendingEmailMessage.toList = this.emailService.toEmail;

        this.emailService.triggerPendingEmail(pendingEmailMessage).then(() => {
            this.activeModal.dismiss();
            this.toasty.success('Email Sent');
        }, (err) => {
            this.toasty.error(err.message);
        });
    }

    initializeEdit() {

        const toolbarOptions = [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            ['link']
        ];

        // INSTANTIATE BASED ON ID
        this.messageQuill = new Quill('#message', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });

        /** @PRAKASH THIS IS HOW YOU ACCESS THE EDITOR HTML AS A STRING **/
        console.log(this.messageQuill.root.innerHTML);

    }

}
