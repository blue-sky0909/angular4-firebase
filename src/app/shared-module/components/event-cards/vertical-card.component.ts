import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import {AngularFireDatabase} from "angularfire2/database";
import {IoEvent} from "../../../shared-models/oevent";
import {EventBookmarkService} from "../../services/event.bookmark.service";

@Component({
    selector: 'vertical-card',
    styles: [

    ],
    templateUrl: './vertical-card.component.html'
})

export class VerticalCardComponent implements OnInit{

    @Input() id:string;
    // ALLOW REMOVAL OF BOOKMARKED EVENTS THAT ARE REMOVED
    @Output() removeEvent:EventEmitter<string> = new EventEmitter<string>();
    event:IoEvent;
    set:boolean = false;
    bookmarkSet:boolean = false;
    image:string;

    constructor(private af: AngularFireDatabase, private router: Router, private bookmarkService:EventBookmarkService) {
        // console.log(this.bookmarkService);
    }

    ngOnInit(){

        this.af.object(`/events/live/${this.id}`).subscribe((data)=>{
            if(data.$exists()){
                this.event = data.data;
                this.set = true;
            }
            else{
                //REMOVE A BOOKMARK IF THE EVENT DOES NOT EXIST
                this.removeEvent.emit(this.id);
            }

        });

        this.checkBookmark();

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
