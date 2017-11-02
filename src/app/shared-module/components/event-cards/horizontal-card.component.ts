import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {AngularFireDatabase} from "angularfire2/database";
import {IoEvent} from "../../../shared-models/oevent";
import {EventBookmarkService} from "../../services/event.bookmark.service";

@Component({
    selector: 'horizontal-card',
    styles: [
        `
            .horiz-bookmark{
                color: #26c6da;
            }   
        `
    ],
    templateUrl: './horizontal-card.component.html'
})

export class HorizontalCardComponent implements OnInit{

    @Input() id:string;
    //ALLOW TRIGGER REMOVAL OF AN EVENT THAT DOES NOT EXISTS
    @Output() removeEvent:EventEmitter<string> = new EventEmitter<string>();
    event:any;
    set:boolean = false;
    image:string;
    bookmarkSet:boolean = false;

    constructor(private af: AngularFireDatabase, private router: Router, private bookmarkService:EventBookmarkService) {

    }

    ngOnInit(){

        this.af.object(`/events/live/${this.id}`).subscribe((data)=>{

            if(data.$exists()){
                this.event = data.data;
                this.set = true;
                this.checkBookmark();
            }

            else{
                //REMOVE NON-EXISTENT EVENT
                this.removeEvent.emit(this.id);
            }


        });
    }

    gotoEvent(){
        this.router.navigateByUrl(`/event/${this.id}`)
    }

    checkBookmark(){
        this.bookmarkService.checkBookmark(this.id).subscribe((data)=>{
            if(data.$exists()){
                this.bookmarkSet = true;
            } else{
                this.bookmarkSet = false;
            }
        });
    }

    toggleBookmark(){

        if(!this.bookmarkSet){
            this.bookmarkService.setBookmark(this.id).then(()=>{
                this.bookmarkSet = true;
            })
        } else{
            this.bookmarkService.removeBookmark(this.id).then(()=>{
                this.bookmarkSet = false;
            });
        }

    }


}
