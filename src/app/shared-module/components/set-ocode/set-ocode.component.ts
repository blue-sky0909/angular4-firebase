import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../../../auth/services/auth-service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {AngularFireDatabase} from "angularfire2/database";
import {ToastyService} from "ng2-toasty";
import {AppService} from "../../../services/app-service";

@Component({
    selector: 'set-ocode',
    styles: [
        `
            
        `
    ],
    template: ` 
        <div *ngIf="auth.authenticated">
                <div *ngIf="!appService.ocodeSet">

                    <p>
                        Get started with your Premium Membership free trial by creating your ōCode below.
                    </p>
                    <br>

                    <div class="form-group" [ngClass]="{'has-error':error}">
                        <div class="input-group"> 
                            <input
                                type="text"
                                class="form-control c-theme input-lg c-margin-b-10"
                                placeholder="Enter your new ōCode"
                                [(ngModel)]="ocode"
                                lowercase
                                (focus)="error=false" >
                            <span class="input-group-btn"> 
                                <button class="btn btn-primary" (click)="setOcode()"> 
                                    <span class="fa fa-check"></span>
                                </button>
                            </span>
                        </div>
                        
                        <div class="error-text" *ngIf="error">
                            {{ errorMsg }}
                        </div>
                        <small>*Your ōCode must contain between 6 and 20 alphanumeric characters.</small>
                    </div>

                </div>
            </div>
            <div *ngIf="!auth.authenticated">
                <h4 class="card-header">Register/Login to start a free trial</h4>

                <a (click)="appService.openJoin()">Register a new account</a><br />
                Already have an account? <a (click)="appService.openLogin()">Login</a>

            </div>


            <div *ngIf="appService.ocodeSet">
                Your ocode: <strong>{{ appService.ocode }}</strong>
            </div>
    `
})

export class SetOcodeComponent {

    suppress:boolean = false;
    ocode:string = "";
    error:boolean = false;
    errorMsg:string = "";

    constructor(public auth: AuthService,
                private router: Router,
                private toasty: ToastyService,
                public activeModal: NgbActiveModal,
                private af: AngularFireDatabase,
                private appService: AppService) {

    }

    gotoFreeTrial(){
        this.activeModal.dismiss();
        this.router.navigateByUrl('/free-trial');
    }

    suppressToggle(){

        let freeTrial$ = this.af.object(`marketing/free-trial-popup/${this.auth.id}`);

        if(!this.suppress){
            freeTrial$.set({'set':true});
        }
        else{
            freeTrial$.remove();
        }
    }

    validate():boolean{
        if(this.ocode.length > 5 && this.ocode.length < 21 && this.ocode.match(/^[0-9a-z]+$/)){
            //THIS IS THE ONLY ERROR COMING ONCE WE HIT THE DB
            this.errorMsg = "Your ōcode is already in use";
            return true;
        }
        else{
            this.errorMsg = "ōcode must be be between 6 and 20 characters and can only contain letters or numbers";
            this.error = true;
            return false;
        }
    }

    setOcode(){
        if(this.validate()){

            this.appService.ocodeService.setOcode(this.ocode).then(()=>{
                this.appService.ocodeService.getOcodeObservable.emit(false);
                this.toasty.success("your new ōcode has been selected!");
            }, (err)=>{
                this.error = true;
            })


        }
    }
}
