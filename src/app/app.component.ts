import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
//operators
import { ToastController } from 'ionic-angular';
import { tap } from 'rxjs/operators';
//plugins
import { Firebase } from '@ionic-native/firebase';
//providers
import { ConfJsonProvider } from '../providers/conf-json/conf-json';
import { BackactProvider } from '../providers/backact/backact';
import { FcmProvider } from '../providers/fcm/fcm';
import { BackEndProvider } from '../providers/back-end/back-end';
import { NetworkServiceProvider } from "../providers/network-service/network-service";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public confJson: ConfJsonProvider,
    public backact: BackactProvider,
    public fcm: FcmProvider,
    public toastCtrl: ToastController,
    public firebaseNative: Firebase,
    public backEnd: BackEndProvider,
    private netService: NetworkServiceProvider
  ) {
    platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.netService.setSubscriptions();

      await this.initDatabase();
      await this.confJson.setConfigVariables();
      this.activateBackgroundBS();
      this.fcm.getToken().then(token => {
        this.backEnd.saveToken(token);
      });

      platform.pause.subscribe(() => {
        console.log('[INFO] App paused');
        //Stop active location
        this.backact.stopActiveLocation();
      });

      platform.resume.subscribe(() => {
        console.log('[INFO] App resumed');
        //Activate active location
        this.backact.startActiveLocation();
      });

      // Listen to incoming messages
      fcm.listenToNotifications().pipe(
        tap(msg => {
          // show a toast
          const toast = toastCtrl.create({
            message: msg.body,
            duration: 10000
          });
          toast.present();
        })
      ).subscribe();
      //refresh token if needed
      this.firebaseNative.onTokenRefresh().subscribe(
        (token: string) => {
          //fcm.refreshToken(token)
          this.backEnd.saveToken(token);
        });
    });
  }

  initDatabase = async () => {
    this.confJson.verifyConfigTable()
    //.then(data => console.log("verifyConfigTable then ", data))
    //.catch((err) => console.log("verifyConfigTable catch ", err));
    this.confJson.verifyContactsTable()
    //.then(data => console.log("verifyContactsTable then ", data))
    //.catch((err) => console.log("verifyContactsTable catch ", err));
  }

  activateBackgroundBS = async () => {
    this.confJson.getBackgroundActiveBS().subscribe(backgroundActive => {
      //activamos/desactivamos el background mode y la localizacion activa
      if (backgroundActive) {
        //Check Background mode and activate it
        this.backact.activateBackGroundMode();
        //Activate active location
        this.backact.startActiveLocation();
      } else {
        //Check Background mode and deactivate it
        this.backact.deactivateBackGroundMode();
        //Stop active location
        this.backact.stopActiveLocation();
      }
      //actualizamos la base de datos local
      this.confJson.updateConfigValue("background_active", backgroundActive)
        .catch(error => console.log(error));
    })
  }

}
