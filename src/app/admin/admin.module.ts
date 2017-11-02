import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DragulaModule} from 'ng2-dragula';
import {adminRouting} from "./admin.routing";
import {AdminComponent} from "./components/admin.component";
import {AdminService} from "./services/admin-service";

@NgModule({
    declarations: [
      AdminComponent
    ],
    entryComponents: [

    ],
    imports: [
        CommonModule,
        adminRouting,
        DragulaModule
    ],
    providers: [
        AdminService
    ],
    exports: [

    ]
})

export class AdminModule
{
}

export { AdminService };