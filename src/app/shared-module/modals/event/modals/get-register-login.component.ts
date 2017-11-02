import {Component, Output, EventEmitter, Input} from '@angular/core';
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { SignInComponent } from "../../../components/sign-in/sign-in";
import { JoinComponent } from "../../../components/join/join";

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
    templateUrl: './register-join.html'
})

export class getRegisterLoginComponent{


    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal,
    ){

    }

    join(){
        this.activeModal.dismiss();
        const signInRef = this.modalService.open(JoinComponent);
        signInRef.componentInstance.name = "Join";
        signInRef.componentInstance.routeThrough = false;
    }

    login(){
        this.activeModal.dismiss();
        const signInRef = this.modalService.open(SignInComponent);
        signInRef.componentInstance.name = "Login";
        signInRef.componentInstance.routeThrough = false;
    }

}