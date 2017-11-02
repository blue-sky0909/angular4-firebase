import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from "./components/profile-component";
import {ProfileService} from "./services/profile-service";
import {CatchRoutesComponent} from "./components/catch-routes-component";
import {SharedModule} from "../shared-module/shared.module";

@NgModule({
    declarations: [
        ProfileComponent,
        CatchRoutesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    providers: [
        ProfileService
    ]

})

export class ProfileModule {}

export { };
