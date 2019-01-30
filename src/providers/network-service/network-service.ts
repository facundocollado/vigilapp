import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network";
import { Platform } from "ionic-angular";
import { BehaviorSubject } from "rxjs/Rx";

import { Toast, ToastController } from "ionic-angular";

@Injectable()
export class NetworkServiceProvider {
  public connected: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private connectionToast: Toast;
  private subscribedToNetworkStatus: boolean = false;

  constructor(private network: Network, private toastCtrl: ToastController, private platform: Platform) {
  }

  public setSubscriptions() {
    if (!this.subscribedToNetworkStatus && this.platform.is("cordova")) {
      this.subscribedToNetworkStatus = true;

      if ("none" === this.network.type) {
        this.showAlert();
      }

      this.network.onConnect().subscribe((val) => {
        this.connected.next(true);
        this.connectionToast.dismiss();
        // console.log("Network onConnect", val);
      });
      this.network.onchange().subscribe((val) => {
        // console.log("Network onchange", val);
      });
      this.network.onDisconnect().subscribe((val) => {
        this.connected.next(false);
        this.showAlert();
      });
    }
  }

  private showAlert() {
    this.connectionToast = this.toastCtrl.create({
      cssClass: "error",
      dismissOnPageChange: false,
      message: "Se ha perdido la conexión",
      position: "top",
      showCloseButton: false,
    });
    this.connectionToast.present();
  }
}