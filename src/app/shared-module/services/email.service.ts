import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable, EventEmitter} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {AuthService} from "../../auth/services/auth-service";
import {EmailSend} from "../../shared-models/email-send";
import * as firebase from 'firebase/app';
import Thenable = firebase.Thenable;
import {EmailMessage} from "../../shared-models/email-message";
import {AppService} from "../../services/app-service";
import {IAccountContact} from "../../account/components/contact/contact-model";

@Injectable()
export class EmailService {

    emailSend:EmailSend;
    set:boolean = false;
    contact$:FirebaseObjectObservable<IAccountContact>;
    contactSet:boolean = false;
    contactEmitter:EventEmitter<any> = new EventEmitter();

    toEmail:string;
    toName:string;
    toEmailSet:boolean = false;

    systemFromEmail:string;
    systemFromName:string;

    emailNotification$:FirebaseListObservable<any>;
    pendingEmailMessages$:FirebaseListObservable<any>;

    constructor(private af: AngularFireDatabase,
                private auth: AuthService,
                private appService: AppService) {

        this.emailNotification$ = this.af.list(`pending-notifications/email`);
        this.pendingEmailMessages$ = this.af.list(`/messages/emails/pending`);
        this.contact$ = this.af.object(`contact/${this.auth.id}`);

    }

    setFromEmail():Promise<string>{
        return new Promise((resolve, reject)=>{
            this.contact$.first().subscribe((contactData)=>{
                this.systemFromEmail = contactData.email;
                this.systemFromName = `${contactData.first} ${contactData.last}`;
                this.contactSet = true;
                this.contactEmitter.emit();
                resolve(this.systemFromEmail);
            });
        });

    }

    setToEmail(email, name){
        this.toEmail = email;
        this.toName = name;
        this.toEmailSet = true;
    }

    triggerEmail(toEmail, toName, replyTo, subject, body):Thenable<any>{
        if(this.contactSet){
            this.toEmailSet = true;
            this.emailSend = new EmailSend(toEmail, toName, this.systemFromEmail, this.systemFromName, subject, body);

            if(this.contactSet && this.toEmailSet){
                return this._sendEmail();
            }

        }
        else{
            this.contactEmitter.first().subscribe(()=>{
                this.toEmailSet = true;
                this.emailSend = new EmailSend(toEmail, toName, this.systemFromEmail, this.systemFromName, subject, body);

                if(this.contactSet && this.toEmailSet){
                    return this._sendEmail();
                }
                else{
                    return new Promise((resolve, reject)=>{ reject('cannot set contect information') });
                }

            });
        }
    }

    triggerPendingEmail(emailMessage : EmailMessage):Thenable<any>{

        return (this.pendingEmailMessages$.push(emailMessage));

    }

    private _sendEmail():Thenable<any>{
        return(this.emailNotification$.push(this.emailSend));
    }

}
