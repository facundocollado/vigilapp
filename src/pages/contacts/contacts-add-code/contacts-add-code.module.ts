import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsAddCodePage } from './contacts-add-code';

@NgModule({
  declarations: [
    ContactsAddCodePage,
  ],
  imports: [
    IonicPageModule.forChild(ContactsAddCodePage),
  ],
})
export class ContactsAddCodePageModule {}
