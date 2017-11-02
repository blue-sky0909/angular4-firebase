import {Component, AfterViewInit, Input} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AngularFireDatabase} from 'angularfire2/database';
import {EmailService} from '../../services/email.service';
import {ToastyService} from 'ng2-toasty';
import {EmailPopupComponent} from '../email/email-popup.component';
import {Router} from '@angular/router';
import {IAccountAbout, AccountAbout} from '../../../account/components/about/about-model';
import {AppService} from '../../../services/app-service';
import {FirebaseApp} from 'angularfire2';
declare var Quill: any;

@Component({
    selector: 'quick-contact',
    styles: [
        `
            .sweet-header-box{
                border:1px solid;
            }

            h4.sweet-header{
                    padding:1rem .5rem;
                    margin:0;
                    color:white;
                    text-align:center;
            }

            .sweet-body{padding:1rem;}
        `
    ],
    template: `
        <div class="sweet-header-box" [style.borderColor]="color">
            <h4 class="sweet-header" [style.backgroundColor]="color" *ngIf="headerDisplay">
                {{ title }}
            </h4>

            <div class="sweet-body">
                <img [src]="about.imageURL" class="img-fluid" *ngIf="about.imageSet" />

                <div style="margin:.75rem 0;text-align:center;">
                    {{ about.organizerName }}
                </div>

                <div class="bottom-actions">
                    <a (click)="email()">
                        <i class="fa fa-envelope"></i>
                        Contact
                    </a>
                    <a (click)="gotoProfile()" class="pull-right">
                        <i class="fa fa-user"></i>
                        View Profile
                    </a>
                </div>
            </div>

        </div>
    `
})
export class QuickContactComponent implements AfterViewInit {

    @Input() profileId;
    @Input() color = '#888888';
    @Input() title;
    @Input() headerDisplay = true;
    about: IAccountAbout = new AccountAbout();
    ocode = '';

    constructor(private af: AngularFireDatabase,
                private appService: AppService,
                private router: Router,
                private app: FirebaseApp,
                public activeModal: NgbActiveModal,
                public modalService: NgbModal,
                public toasty: ToastyService,
                public emailService: EmailService) {

    }

    ngAfterViewInit() {
        this.af.object(`/about/${this.profileId}`).first().subscribe((data) => {
           this.about = data;
        });

        this.af.object(`/ocodesById/${this.profileId}`).first().subscribe((data) => {
            this.ocode = data.ocode;
        });

        this.app.storage().ref(`userImages/${this.profileId}/profile`).getDownloadURL().then((URL) => {
          // console.log(URL);
          this.about.imageURL = URL;
        });

    }

    email() {
        this.emailService.setToEmail(this.about.email, this.about.organizerName);
        this.activeModal.dismiss();
        const signInRef = this.modalService.open(EmailPopupComponent);
        signInRef.componentInstance.name = 'Attend';
    }

    gotoProfile() {
        this.router.navigateByUrl(`/${this.ocode}`);
    }

}
