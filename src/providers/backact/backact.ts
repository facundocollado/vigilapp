import { Injectable } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Geolocation } from '@ionic-native/geolocation';
import { AngularFirestore } from 'angularfire2/firestore';
//libraries
//import { Observable } from "rxjs/Observable";
//import { TimerObservable } from "rxjs/observable/TimerObservable";
//providers
import { ConfJsonProvider } from '../../providers/conf-json/conf-json';
import { BackEndProvider } from '../../providers/back-end/back-end';

@Injectable()
export class BackactProvider {

  background: BackgroundMode;

  constructor(
    private backgroundMode: BackgroundMode,
    private geolocation: Geolocation,
    public afs: AngularFirestore,
    public confJson: ConfJsonProvider,
    public backEnd: BackEndProvider
  ) {
    this.backgroundMode.configure({
      //silent: true
      icon: "res://finder"
    });

    this.backgroundMode.setDefaults({
      title: "Finder",
      text: "Iniciada localizacion pasiva.",
      //color: "FF0000",
      icon: "res://finder",
      ticker: "Iniciada localizacion pasiva."
      //hidden: true
      //silent: true
    });

  }

  passiveIntervalVar: any; //variable que aloja el setInterval() pasivo
  backgroundActivateSubscription: any;  //background activated subscriptions used to unsubscribe if tue user
  backgroundDeactivateSubscription: any;  //is not using the background mode function and avoid memory leaks
  activeLocationInterval: any;  //active location subscription


  async activateBackGroundMode() {

    if (!this.backgroundMode.isActive() && !this.backgroundMode.isEnabled() && this.confJson.backgroundActiveBS.getValue()) {
      this.enableBackground().then(() => {
        this.backgroundActivateSubscription = this.backgroundMode.on("activate").subscribe(() => {
          console.log("Activated Background Mode event");
          //Enable GPS-tracking in background (Android).
          this.backgroundMode.disableWebViewOptimizations();
          this.saveLocation();
          //generamos el loop por el cual se registraran los movimientos del usuario
          this.passiveIntervalVar = setInterval(() => {
            this.saveLocation();
          }, this.confJson.passiveInterval);

        }, (err) => { console.log("backgroundMode.on activate ", err) });

        this.backgroundDeactivateSubscription = this.backgroundMode.on('deactivate').subscribe(() => {
          clearInterval(this.passiveIntervalVar);
          console.log("Stopped passive location");
        });

      }).catch(error => console.log("Error Enable Background", error));

    }

  }
  //clears all backgrounds subscriptions in order to deactivate background mode
  async deactivateBackGroundMode() {
    //the background is enabled, so we disabled it only if the user has deactivated it.
    if (this.backgroundMode.isEnabled() && !this.confJson.backgroundActiveBS.getValue()) {

      this.backgroundActivateSubscription.unsubscribe();
      this.backgroundDeactivateSubscription.unsubscribe();
      clearInterval(this.passiveIntervalVar);
      this.disableBackground().catch(error => console.log("Error Disable Background", error));

    }

  }

  //enable background promise, in order to detect errors
  private enableBackground() {
    return new Promise((resolve, reject) => {
      try {
        this.backgroundMode.enable();
        resolve({ code: 200, msg: "Background Enabled" });
      } catch (error) {
        reject({ error: 400, msg: error });
      }
    });
  }
  //disable background promise, in order to detect errors
  private disableBackground() {
    return new Promise((resolve, reject) => {
      try {
        this.backgroundMode.disable();
        resolve({ code: 200, msg: "Background Disabled" });
      } catch (error) {
        reject({ error: 400, msg: error });
      }
    });
  }

  //funcion que activa o desactiva el background mode, passiveStatus es true o false
  toggleBackground(passiveStatus) {
    //devolvemos una promesa de resolucion
    return new Promise((resolve, reject) => {
      try {
        //si passiveStatus es true y el background no esta activo lo activamos
        if (passiveStatus && !this.backgroundMode.isEnabled()) {
          this.enableBackground()
            .then(data => {
              resolve({ code: 200, msg: "Background Enabled" });
            })
            .catch(error => reject({ code: 400, msg: error.msg }));

          //si passiveStatus es false y el background esta activo lo desactivamos
        } else if (!passiveStatus && this.backgroundMode.isEnabled()) {

          this.disableBackground()
            .then((data) => {
              resolve({ code: 200, msg: "Background Disabled" });
            })
            .catch(error => reject({ code: 400, msg: error.msg }));
        }
      } catch (error) {
        console.log("error en toggleBackground", error);
      }
    });
  }

  startActiveLocation() {
    clearInterval(this.activeLocationInterval);
    if (this.confJson.backgroundActiveBS.getValue()) {
      this.activeLocationInterval = setInterval(() => {
        this.saveLocation();
      }, this.confJson.passiveInterval);
    }
  }

  stopActiveLocation() {
    clearInterval(this.activeLocationInterval);
  }

  private saveLocation() {
    console.log("saveLocation");
    this.geolocation.getCurrentPosition()
      .then((resp) => {
        console.log("got resp?", resp);

        this.backEnd.saveLocation(resp.coords.latitude, resp.coords.longitude);


        /*
        let devicesRef = this.afs.collection(`${deviceUid}`); //this.afs.collection(this.config.deviceUuid);
        let docData = {
          "lat": resp.coords.latitude,
          "lng": resp.coords.longitude,
          "date": firebase.firestore.FieldValue.serverTimestamp()
        }

        devicesRef.doc(this.afs.createId()).set(docData);*/

        /*resp.coords.latitude,
      "lng": resp.coords.longitude
      */



      }).catch((error) => {
        console.log('Error w/ getCurrentPosition: ' + JSON.stringify(error), error.code, error.message);
      });
  }

}
/*        
console.log("GPS request", new Date().toLocaleDateString("es-AR", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
        */