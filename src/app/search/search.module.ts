import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {SearchResultsComponent} from "./components/search-results-component";
import {SearchService} from "../shared-module/services/search-service";
import {SharedModule} from "../shared-module/shared.module";
import {NgbPaginationModule,NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {EventsearchService} from "./services/eventsearch.service";
import {AuthGuard} from "../auth/guards/auth-guard";

const routes: Routes = [
    {path: '', component: SearchResultsComponent}
];

@NgModule({
    declarations: [
        SearchResultsComponent,

    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule,
        NgbPaginationModule,
        NgbDatepickerModule
    ],
    providers: [
        EventsearchService
    ]



})

export class SearchModule {}

export { };
