import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfJsonProvider } from '../../providers/conf-json/conf-json';
import { Observable } from 'rxjs-compat'


@Injectable()
export class BackEndProvider {

  url = "http://finderbackend.hol.es/";
  //save_location";
  headers = new HttpHeaders();
  deviceUid: string;

  constructor(public http: HttpClient, public confJsonProvider: ConfJsonProvider) {
    this.headers.set('Access-Control-Allow-Origin', '*');
    this.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
    this.headers.set('Accept', 'application/json');
    this.headers.set('Content-Type', 'application/x-www-form-urlencoded');
  }

  //save token for push notifications
  saveToken(token) {
    let json = {
      "device_uid": this.confJsonProvider.deviceUid,
      "device_manufacturer": this.confJsonProvider.deviceManufacturer,
      "device_model": this.confJsonProvider.deviceModel,
      "device_platform": this.confJsonProvider.devicePlatform,
      "device_version": this.confJsonProvider.deviceVersion,
      "token": token
    }

    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    postData.append("token", token);
    return this.httpPost("save_token", postData);
  }
  saveLocation(lat, lng) {
    let json = {
      "device_uid": this.confJsonProvider.deviceUid,
      "lat": lat,
      "lng": lng
    }

    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    //podria asignarse esto a un valor tipo Observable<any>
    this.http.post(this.url + "save_location", postData, { headers: this.headers })
      .subscribe(data => {
        //got server response console.log(data);
      }, error => {
        console.log("http error ", error)
      });
  }

  requestPersonalCode() {
    let json = { "device_uid": this.confJsonProvider.deviceUid }
    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    return this.httpPost("request_personal_code", postData);
  }

  addContactByCode(code) {
    let json = { "device_uid": this.confJsonProvider.deviceUid, "code": code }
    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    return this.httpPost("send_contact_invitation_code", postData);
  }

  getPendingContacts() {
    let json = { "device_uid": this.confJsonProvider.deviceUid }
    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    return this.httpPost("get_pending_contacts", postData);
  }

  acceptPendingContact(contactUid) {
    let json = { "device_uid": this.confJsonProvider.deviceUid, "contact_uid": contactUid }
    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    return this.httpPost("accept_pending_contact", postData);
  }

  getContacts() {
    let json = { "device_uid": this.confJsonProvider.deviceUid }
    let postData = new FormData();
    postData.append("json", JSON.stringify(json));
    return this.httpPost("get_contacts", postData);
  }

  //interfaz general de consultas al backend
  private httpPost(route, postData) {
    return new Promise((resolve, reject) => {
      //podria asignarse esto a un valor tipo Observable<any>
      this.http.post(this.url + route, postData, { headers: this.headers })
        .subscribe(data => {
          resolve(data);
        }, error => {
          console.log("http error ", error);
          reject({ error: error });
        })
    })
  }

  //actualizador de localizacion de contactos
  getContactsLocation(contactsArray): Observable<any> {
    let postData = new FormData();
    
    postData.append("user", this.confJsonProvider.deviceUid);
    postData.append("contacts", JSON.stringify(contactsArray));

    return this.http.post(this.url + "get_contacts_location", postData, { headers: this.headers });
  }


}
