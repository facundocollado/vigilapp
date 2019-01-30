import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';
import { ToastController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
//libraries
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { TimerObservable } from "rxjs/observable/TimerObservable";

@Injectable()
export class ConfJsonProvider {

  /*for (let i = 0; i < data["data"].length; i++) {
    console.log(data["data"].item(i));
  }*/
  public db: SQLiteObject;
  public isOpen: boolean;
  //Device variables globales
  public deviceUid: string;
  public deviceManufacturer: string;
  public deviceModel: string;
  public devicePlatform: string;
  public deviceVersion: string;
  //Config variables globales
  public passiveInterval: number;
  //variable que vigila la variable backgroundaActive de de ConfJson
  backgroundActiveBS: any;


  constructor(
    public device: Device,
    private toastCtrl: ToastController,
    private storage: SQLite
  ) {
    if (device.uuid !== null) {
      this.deviceUid = device.uuid;
      this.deviceManufacturer = device.manufacturer;
      this.deviceModel = device.model;
      this.devicePlatform = device.platform;
      this.deviceVersion = device.version;
    } else {
      this.deviceUid = "0browser";
      this.deviceManufacturer = "Mozilla";
      this.deviceModel = "Geko";
      this.devicePlatform = "PC";
      this.deviceVersion = "7";
    }

    if (!this.isOpen) {
      storage = new SQLite();
      //creates or open the database if it already exist
      storage.create({ name: "finder.db", location: "default" })
        .then((db: SQLiteObject) => {
          this.db = db;
          this.isOpen = true;
        }, (error) => {
          console.error("Unable to open database", error);
        });
    }
  }

  //validamos la tabla config 
  createConfigTable() {
    return this.db.executeSql('CREATE TABLE IF NOT EXISTS config (' +
      'device_uid VARCHAR(50) PRIMARY KEY, ' +
      'device_model VARCHAR(50), ' +
      'device_manufacturer VARCHAR(50), ' +
      'device_platform VARCHAR(50), ' +
      'background_active BOOL, ' +
      'passive_interval int(10)' +
      ')', []);
  }
  createContactsTable() {
    return this.db.executeSql('CREATE TABLE IF NOT EXISTS contacts (' +
      'id INT(10) PRIMARY KEY NOT NULL, ' +
      'device_uid VARCHAR(50), ' +
      'device_model VARCHAR(50), ' +
      'device_manufacturer VARCHAR(50), ' +
      'name VARCHAR(50) )', []);
  }

  //verificamos si la tabla tiene datos
  async verifyConfigTable() {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT * FROM config", [])
        .then(result => {
          if (result.rows.length > 0) {
            resolve({ code: 200, msg: "TABLE config is not empty.", data: result.rows });
          } else {
            return this.setDefaultConfigTableData()
              .then(data => resolve({ code: 200, msg: "Config EMPTY. Data inserted in config.", data: data }))
              .catch(error => reject({ code: 400, msg: "Config EMPTY. Data not inserted in config.", error: error }));
          }
        })
        .catch(error => {
          //no existe la tabla
          if (error.code === 5) {
            this.createConfigTable()
              .then(() => {
                //la populamos con los valores por defecto
                return this.setDefaultConfigTableData()
                  .then(data => resolve({ code: 200, msg: "Config TABLE CREATED. Data inserted in config.", data: data }))
                  .catch(error => reject({ code: 400, msg: "Config TABLE CREATED. Data not inserted in config.", error: error }));
              })
              .catch(error => {
                reject({ code: 400, msg: "config TABLE NOT CREATED.", error: error });
              });

          } else {
            reject({ code: 400, msg: "UNKNOWN ERROR COULD NOT SELECT * FROM config.", error: error });
          }

        });
    });
  }

  //ponemos los datos de configuracion por defecto
  setDefaultConfigTableData() {
    return new Promise((resolve, reject) => {
      let sql = "INSERT OR REPLACE INTO config ('device_uid', 'device_model', 'device_manufacturer', 'device_platform', 'background_active', 'passive_interval') VALUES (?,?,?,?,?,?)";
      this.db.executeSql(sql, [this.device.uuid, this.device.model, this.device.manufacturer, this.device.platform, true, 1800000])
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //verificamos si la tabla tiene datos
  async verifyContactsTable() {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT * FROM contacts", [])
        .then(result => {
          resolve({ code: 200, msg: "TABLE contacts exists.", data: result.rows });
        })
        .catch(error => {
          //no existe la tabla
          if (error.code === 5) {
            this.createContactsTable()
              .then((data) => {
                resolve({ code: 200, msg: "contacts TABLE CREATED.", data: data });
              })
              .catch(error => {
                reject({ code: 400, msg: "contacts TABLE NOT CREATED.", error: error });
              });
          } else {
            reject({ code: 400, msg: "UNKNOWN ERROR COULD NOT SELECT * FROM contacts.", error: error });
          }
        });
    });
  }

  //obtiene el valor solicitado de la tabla config
  getConfigValue(value) {
    return new Promise((resolve, reject) => {
      this.db.executeSql(`SELECT ${value} FROM config LIMIT 1`, [])
        .then(result => {
          resolve({ code: 200, msg: "Obtained config value.", data: result.rows.item(0)[value] });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //actualiza un valor de la tabla config
  updateConfigValue(column, value) {
    return new Promise((resolve, reject) => {
      this.db.executeSql(`UPDATE config SET ${column} = "${value}" WHERE 1`, [])
        .then(result => {
          resolve({ code: 200, msg: "Updated config value.", data: result });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //obtiene el valor solicitado de la tabla config
  getConfigValues(values) {
    return new Promise((resolve, reject) => {
      this.db.executeSql(`SELECT ${values} FROM config LIMIT 1`, [])
        .then(result => {
          resolve({ code: 200, msg: "Obtained config value.", data: result.rows.item(0) });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //actualiza la tabla de contactos
  updateLocalContactsList(contactsList) {
    return new Promise((resolve, reject) => {
      contactsList.forEach(contact => {
        let sql = "INSERT OR REPLACE INTO contacts ('id', 'device_uid', 'device_model', 'device_manufacturer', 'name') VALUES (?,?,?,?,?)";
        this.db.executeSql(sql, [contact["id"], contact["device_uid"], contact["device_model"], contact["device_manufacturer"], contact["name"]])
          .then(result => {
            resolve({ code: 200, msg: "Updated contacts list.", data: result });
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }

  searchLocalContacts(keyword) {
    //return this.db.executeSql(`SELECT * FROM contacts`, []);
    return this.db.executeSql(`SELECT id, device_uid, name, device_model, device_manufacturer FROM contacts WHERE (
       name LIKE '%${keyword}%' 
       OR device_model LIKE '%${keyword}%' 
       OR device_manufacturer LIKE '%${keyword}%')`, [])
  }

  async setConfigVariables() {
    await this.getConfigValues("passive_interval, background_active").then(result => {
      //tomamos los datos intervalo pasivo y si la localizacion esta activada
      this.passiveInterval = result["data"].passive_interval;
      //inicializa el behavior subject
      this.backgroundActiveBS = new BehaviorSubject<boolean>(result["data"].background_active === 'true');
    });
  }


  //GET Y SET DEL BEHAVIOR SUBJECT BACKGROUND ACTIVE
  public getBackgroundActiveBS(): Observable<boolean> {
    return this.backgroundActiveBS.asObservable();
  }
  public setBackgroundActiveBS(newValue: boolean): void {
    this.backgroundActiveBS.next(newValue);
  }


  //mensajes de error al usuario
  private presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      //console.log('Dismissed toast');
    });

    toast.present();
  }
}