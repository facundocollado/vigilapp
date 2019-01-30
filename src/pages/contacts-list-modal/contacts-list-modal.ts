import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { ConfJsonProvider } from '../../providers/conf-json/conf-json';

@IonicPage()
@Component({
  selector: 'page-contacts-list-modal',
  templateUrl: 'contacts-list-modal.html',
})
export class ContactsListModalPage {

  contactsList: Array<any> = [];
  contacts: boolean = false;

  constructor(private viewCtrl: ViewController, 
    private navParams: NavParams,
    public confJson: ConfJsonProvider) {
   
  }

  ionViewDidLoad() {
    this.getLocalContacts("");
  }

  closeModal() {
    this.viewCtrl.dismiss(null);
  }

  getLocalContacts(keyword) {
    this.confJson.searchLocalContacts(keyword)
      .then(result => {
        this.contactsList = [];
        if (result.rows.length > 0) {
          for (var i = 0; i < result.rows.length; i++) {
            this.contactsList.push({
              id: result.rows.item(i).id,
              device_uid: result.rows.item(i).device_uid,
              name: result.rows.item(i).name,
              device_model: result.rows.item(i).device_model,
              device_manufacturer: result.rows.item(i).device_manufacturer
            });
          }
          this.contacts = true;
        } else {
          this.contacts = false;
        }
      })
      .catch(error => console.log("cannot find local contacts list", error));
  }

  filterContacts(ev: any) {
    let keyword = ev.target.value;
    if (keyword && keyword.trim() !== '') {
      this.getLocalContacts(keyword);
      /*this.items = this.items.filter(function(item) {
        return item.toLowerCase().includes(val.toLowerCase());
      });*/
    }
  }

  locateContactMap(user_id) {
    const user_ids = {
      id: user_id
    }
    this.viewCtrl.dismiss(user_ids);
  }


  /*getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
  }*/
}


