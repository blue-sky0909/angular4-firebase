import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import 'firebase/storage';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ]
})

export class FirebaseModule {

}
