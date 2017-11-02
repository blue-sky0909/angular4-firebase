import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import {AppService} from "../../services/app-service";
import {AuthService} from "../../auth/services/auth-service";
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";

@Component({
    encapsulation: ViewEncapsulation.None,
    styles: [

    ],
    template: `
        <section class="secondary-content">
            <div *ngIf="four">
                <h1>This page does not exist!</h1>
            </div>
        </section>
    `
})

export class CatchRoutesComponent {

    four:boolean = false;

    constructor(public appService: AppService, public auth: AuthService, private route: ActivatedRoute, private router: Router) {
        this.route.url.subscribe((pathArray)=>{
            if(pathArray.length !== 1){
                this.show404();
            }
            else{
                this.appService.ocodeService.getOcode(pathArray[0].path).subscribe((data)=>{
                   if(data.$exists()){
                       this.router.navigateByUrl(`/profile/${data.uid}`);
                   }
                   else{
                       this.show404();
                   }
                });
            }
        });


    }

    show404(){
        this.four = true;
    }

}
