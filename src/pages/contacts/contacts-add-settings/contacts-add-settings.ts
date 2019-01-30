import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { BackEndProvider } from '../../../providers/back-end/back-end';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-contacts-add-settings',
  templateUrl: 'contacts-add-settings.html',
})
export class ContactsAddSettingsPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public backEnd: BackEndProvider,
    private socialSharing: SocialSharing) {
  }

  ionViewDidLoad() {
  }


  contactShareCode() {
    const loader = this.loadingCtrl.create({
      content: "Obteniendo c&oacute;digo..."
    });
    loader.present();

    this.backEnd.requestPersonalCode()
      .then(data => {
        if(data["code"] === 200){
          this.share(data["data"], "Finder", null, null)
        }
        console.log("data del backend", data);
        loader.dismiss();        
      })
      .catch(error => {
        console.log("error del backend", error);
        loader.dismiss();
      });

    /* setTimeout(() => {
     }, 5000);*/

  }

  share(message, subject, file, link) {
    this.socialSharing.share(message, subject, file, link)
      .then(data => {
        console.log("sucessfully shared code", data);
      })
      .catch(error => {
        console.log("share code error", error);
      })
  }

  contactAddByCode(){
    this.navCtrl.push('ContactsAddCodePage');
  }
}