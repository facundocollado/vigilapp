import { Component } from '@angular/core';
import { BackEndProvider } from '../../providers/back-end/back-end';
import { LoadingController, AlertController } from 'ionic-angular';
import { trigger, state, style, animate, transition } from '@angular/core'; //animacion al remover item

@Component({
  selector: 'pending-list',
  templateUrl: 'pending-list.html',
  animations: [
    trigger('fadeInOut', [
      transition('void => *', [
        style({ opacity: '0', transform: 'translateY(100%)' }),
        animate('300ms linear')
      ]),
      transition('* => void', [
        animate(300, style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class PendingListComponent {

  pendingsList: Array<any> = [];
  pendings: boolean = false;
  constructor(public backEnd: BackEndProvider,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController) {
    this.getPending();
  }

  getPending() {
    this.backEnd.getPendingContacts()
      .then((data) => {
        //si hay pendientes
        if (data["code"] === 200 && typeof data["data"] !== 'undefined' && data["data"].length > 0) {
          this.pendings = true;
          this.pendingsList = data["data"];
        }
      })
      .catch(error => console.log(error));
  }

  //https://ionicframework.com/docs/api/components/refresher/Refresher/
  refreshPending(refresher) {
    this.getPending();
    refresher.complete();
  }

  acceptPending(contactUid, i) {
    const loader = this.loadingCtrl.create({
      content: "Enviando invitaci&oacute;n..."
    });
    loader.present();
    this.backEnd.acceptPendingContact(contactUid)
      .then((data) => {
        loader.dismiss();
        //si hay pendientes
        if (data["code"] === 200) {
          let alert = this.alertCtrl.create({
            title: data["msg"],
            buttons: ['Ok']
          });
          alert.present();

          this.pendingsList.splice(i, 1);
          //quitamos el elemento de la lista

          /*let index = this.pendingsList.indexOf(i);
          console.log(this.pendingsList, index);
          if (index > -1) {
            this.pendingsList.splice(i, 1);
            console.log(this.pendingsList);
          }*/
        }
      })
      .catch(error => {
        console.log("error del backend", error);
        loader.dismiss();
      });
  }


}

