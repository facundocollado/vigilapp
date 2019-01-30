import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { ContactsListComponent } from './contacts-list/contacts-list';
import { PendingListComponent } from './pending-list/pending-list';

@NgModule({
	declarations: [
		ContactsListComponent,
		PendingListComponent
	],
	imports: [
		IonicModule.forRoot(ContactsListComponent),
		IonicModule.forRoot(PendingListComponent)
	],
	exports: [
		ContactsListComponent,
		PendingListComponent]
})
export class ComponentsModule { }