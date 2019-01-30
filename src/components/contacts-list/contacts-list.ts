import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { BackEndProvider } from '../../providers/back-end/back-end';
import { ConfJsonProvider } from '../../providers/conf-json/conf-json';

@Component({
  selector: 'contacts-list',
  templateUrl: 'contacts-list.html'
})
export class ContactsListComponent {

  contactsList: Array<any> = [];
  contacts: boolean = false;

  constructor(public navCtrl: NavController,
    public backEnd: BackEndProvider,
    public confJson: ConfJsonProvider,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController) {
    this.getContacts();
  }

  getContacts() {
    const loader = this.loadingCtrl.create({
      content: "Cargando contactos..."
    });
    loader.present();
    this.backEnd.getContacts()
      .then((data) => {
        //si hay pendientes
        if (data["code"] === 200 && typeof data["data"] !== 'undefined' && data["data"].length > 0) {
          this.contacts = true;
          this.contactsList = data["data"];
          loader.dismiss();
          this.saveContactsLocally();
        } else {
          this.contacts = false;
          loader.dismiss();
        }
      })
      .catch(error => {
        console.log(error);
        loader.dismiss();
      });
  }

  refreshContacts(refresher) {
    this.getContacts();
    refresher.complete();
  }

  contactAdd() {
    this.navCtrl.push('ContactsAddSettingsPage');
    //this.navCtrl.setRoot(ContactsAddSettingsPage, {}, {animate: true, direction: 'forward'});
  }

  saveContactsLocally() {
    this.confJson.updateLocalContactsList(this.contactsList)
      .then(data => {})
      .catch(error => console.log("contacts not saved", error));
  }
}