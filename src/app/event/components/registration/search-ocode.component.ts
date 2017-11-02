import {Component, OnInit} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {EventService} from "../../../shared-module/services/event-service";

@Component({
               selector: 'search-ocode',
               styles: [
                   `
            .login-error{padding-bottom:15px;}
        `
               ],
               templateUrl: './search-ocode.component.html'
           })

export class SearchOcodeComponent implements OnInit {
    oCodeSearchStr:string;

    constructor(public activeModal: NgbActiveModal, private eventService:EventService) {
    }

    ngOnInit(): void{
        console.log(this.eventService.promoters);
    }

    searchOcode():void{
        console.log("Search ocode : "+this.oCodeSearchStr);
    }


}
