import {Component, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {AngularFireDatabase} from "angularfire2/database/database";
import {AppService} from "../../../services/app-service";

@Component({
    selector: 'need-ocode',
    styles: [

    ],
    templateUrl: './need-ocode.html'
})

export class NeedOcodeComponent {

    constructor(private auth: AuthService,
                private router: Router,
                private af:AngularFireDatabase,
                public appService: AppService,
                public activeModal: NgbActiveModal) {

    }

}
