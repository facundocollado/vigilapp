import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsListModalPage } from './contacts-list-modal';
//import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ContactsListModalPage,
  ],
  imports: [
    //ComponentsModule,
    IonicPageModule.forChild(ContactsListModalPage),
  ],
})
export class ContactsListModalPageModule {}
