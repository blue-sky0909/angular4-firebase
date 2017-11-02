import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, AfterContentInit, OnInit} from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized, ActivatedRoute, Params} from '@angular/router';
import {AuthService} from "../../auth/services/auth-service";
import {ProfileService} from "../services/profile-service";
import {AppService} from "../../services/app-service";
import {FollowingService} from "../../shared-module/services/following.service";
import {EmailPopupComponent} from "../../shared-module/components/email/email-popup.component";
import {EmailService} from "../../shared-module/services/email.service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NgbModalStack} from "@ng-bootstrap/ng-bootstrap/modal/modal-stack";
import {AccountContactService} from "../../shared-module/services/account-contact-service";
import {IAccountContact, AccountContact} from "../../account/components/contact/contact-model";
declare var Quill:any;

@Component({
    templateUrl: './profile.html',
    styleUrls: [
        './profile.scss'
    ],

})

export class ProfileComponent implements OnInit{

    id:string;
    description:any;
    four04:boolean = false;
    followed:boolean = false;
    profileContact:IAccountContact = new AccountContact();
    ocode:string = "";

    constructor(private auth: AuthService,
                private appService: AppService,
                private router: Router,
                private route: ActivatedRoute,
                public profileService: ProfileService,
                public followingService: FollowingService,
                private emailService:EmailService,
                private accountContactService:AccountContactService,
                private activeModal:NgbActiveModal,
                private modalService: NgbModal) {

    }

    // -----------------------------------------------------------------------------------------------------------------------
    // GET ID PARAM AND SET THE SESSION DATA
    // -----------------------------------------------------------------------------------------------------------------------
    ngOnInit(): void{
        this.appService.updateContactAndAbout();

        this.route.url.subscribe((pathArray)=> {
            if(pathArray.length !== 1){
                this.show404();
            } else {
                this.ocode = pathArray[0].path;
                this.appService.ocodeService.getOcode(this.ocode).subscribe((data)=> {
                    if(data.$exists()){
                        this.id = data.uid;
                        this.profileService.setInfo(data.uid);
                        this.checkFollow();
                        this.setProfileContact(data.uid);
                    }
                    else{
                        this.show404();
                    }
                });
            }
        });
    }

    setProfileContact(id){
        this.accountContactService.getContactRef(id).first().subscribe((contactData:IAccountContact)=> {
            this.profileContact = contactData;
        });

    }

    show404(){
        this.four04 = true;
    }

    checkFollow(){
        this.followingService.checkFollow(this.id).subscribe((data)=> {
            this.followed = data.$exists();
        })
    }

    follow(){
        this.appService.startLoadingBar();
        this.followingService.setFollowAndFollower(this.id,this.profileContact).then(()=> {
            this.appService.stopLoadingBar();
        });
    }

    setLimit(num){
        this.profileService.setLimit(num);
    }

    email(){
        this.emailService.setToEmail(this.profileService.contact.email, this.profileService.profile.organizerName);
        this.activeModal.dismiss();
        const emailRef = this.modalService.open(EmailPopupComponent);
        emailRef.componentInstance.name = "Email Organizer";
    }

}
