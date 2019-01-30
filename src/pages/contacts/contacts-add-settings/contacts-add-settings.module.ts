import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsAddSettingsPage } from './contacts-add-settings';

@NgModule({
  declarations: [
    ContactsAddSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(ContactsAddSettingsPage),
  ],
})
export class ContactsAddSettingsPageModule {}
