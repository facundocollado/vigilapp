import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ConfJsonProvider } from '../../providers/conf-json/conf-json';
import { BackactProvider } from '../../providers/backact/backact';

@IonicPage()
@Component({
  selector: 'page-configurations',
  templateUrl: 'configurations.html',
})
export class ConfigurationsPage {

  passiveMode: boolean;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private confJsonProvider: ConfJsonProvider,
    public backactProvider: BackactProvider) {

    this.passiveMode = this.confJsonProvider.backgroundActiveBS.getValue();
    //console.log(this.confJsonProvider.passiveInterval, this.confJsonProvider.backgroundActive);
    //device_uid, device_model, device_manufacturer, device_platform, 
    /*confJsonProvider.getConfigValue("background_active")
      .then((result) => {
        this.passiveMode = result["data"];
      })
      .catch(error =>
        console.log(error)
      );


    confJsonProvider.getConfigValue("passive_interval")
      .then((result) => {
        this.passiveInterval = result["data"];
      })
      .catch(error =>
        console.log(error)
      );*/
  }

  ionViewDidLoad() { }

  //activa/desactiva localizacion pasiva, actualiza el archivo config.
  passiveModeChange() {
    this.confJsonProvider.setBackgroundActiveBS(this.passiveMode);
  }

  //modifica el intervalo de localizacion pasiva
  passivIntervalChange() {
    //this.confJsonProvider.passiveInterval = Number(this.confJsonProvider.passiveInterval);
    //Number(this.confJsonProvider.passiveInterval);
    this.confJsonProvider.updateConfigValue("passive_interval", this.confJsonProvider.passiveInterval)
    //restart active location
    .then(() => this.backactProvider.startActiveLocation())
      .catch(error => console.log(error));
  }
}




/*import { LoadingController } from 'ionic-angular';

export class MyPage {

  constructor(public loadingCtrl: LoadingController) { }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
  }
}*/