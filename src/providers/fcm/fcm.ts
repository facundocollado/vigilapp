import { Injectable } from '@angular/core';

import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { ConfJsonProvider } from '../../providers/conf-json/conf-json';
import { BackEndProvider } from '../../providers/back-end/back-end';

@Injectable()
export class FcmProvider {

  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform,
    public confJson: ConfJsonProvider,
    public backEnd: BackEndProvider
  ) { }
  // Get permission from the user
  async getToken() {
      let token;

      //tomamos token
      if (this.platform.is('android')) {
        token = await this.firebaseNative.getToken().catch(error => console.log("token error", error));
      }

      if (this.platform.is('ios')) {
        token = await this.firebaseNative.getToken();
        const perm = await this.firebaseNative.grantPermission();
      }

      //Is not cordova == web  PWA
      if (!this.platform.is('cordova')) {
        console.log("no es cordova");
      }

      return token;
  }

  // Save the token to firestore
  /*private saveTokenToFirestore(token) {
    if (!token) return;

    this.confJson.getConfigValue("device_uid")
      .then(result => {
        
        //const devicesRef = this.afs.collection(`${result["data"]}`);
        const docData = {
          token,
          date: firebase.firestore.FieldValue.serverTimestamp()
        }
        //this.afs.createId()
        //devicesRef.doc("token").set(docData);

      })
      .catch(error => console.log(error));

  }*/

  // Listen to incoming FCM messages
  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen();
  }
/*
  refreshToken(token) {
    this.saveTokenToFirestore(token);
  }
*/
}
