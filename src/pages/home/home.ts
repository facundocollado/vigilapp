import { Component } from '@angular/core';
import { NavController, ModalController, FabContainer, Modal, LoadingController, AlertController, ActionSheetController } from 'ionic-angular';
//librerias
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { Geolocation } from '@ionic-native/geolocation';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  MarkerIcon,
  LocationService,
  MyLocation,
  ILatLng //for latitude and longitude set position
} from '@ionic-native/google-maps';
//react extension javascript (rxjs)
import { Subject, BehaviorSubject, Observable, Subscription } from 'rxjs-compat'
import { map, filter, scan } from 'rxjs/operators';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import 'rxjs/add/operator/takeWhile';
//proveedores
import { FcmProvider } from '../../providers/fcm/fcm';
import { BackEndProvider } from '../../providers/back-end/back-end';
import { ConfigurationsPageModule } from '../configurations/configurations.module';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private geolocation: Geolocation,
    public backEnd: BackEndProvider,
    private fdb: AngularFireDatabase,
    public afs: AngularFirestore,
    private fcm: FcmProvider
  ) { }
  //objeto GoogleMap
  map: GoogleMap;
  //default user marker
  myMarker: Marker;
  //default user marker icon
  myMarkerIcon: MarkerIcon = {
    url: 'assets/imgs/map/circle_dot_fill.png',
    size: {
      width: 24,
      height: 24
    }
  };

  updateMarkersTimer: number = 10000; //300000; //intervalo de tiempo para actualizar los marcadores (cada 5 minutos)
  activeContacts: Array<any> = [];  //array de contactos activos
  timerObservable: any;

  markersArray: Marker[]; //array of markers for the map  //BORRAR
  updateMarkersActive: boolean = false; //variable que activa o desactiva el actualizador de marcadores //BORRAR
  //BORRAR A FUTURO
  arrDatos = [];
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  add: any;

  intervaloLocalizacionPasiva: number = 1800000;  //30 minutos
  latitud: number = 0;
  longitud: number = 0;

  isTracking = false;
  trackedRoute = [];
  positionSubscription: any;
  currentMapTrack = null;

  ngAfterViewInit() {
    this.loadMap();
    //this.geolocationNative();
  }

  loadMap() {
    const loader = this.loadingCtrl.create();
    loader.present();
    LocationService.getMyLocation().then((myLocation: MyLocation) => {
      this.latitud = myLocation.latLng.lat;
      this.longitud = myLocation.latLng.lng;
      let options: GoogleMapOptions = {
        camera: {
          target: myLocation.latLng,
          zoom: 13,
          tilt: 30,
        },
        controls: {
          'compass': false,
          'myLocationButton': false,
          'myLocation': false,   // (blue dot)
          'indoorPicker': false,
          'zoom': false,          // android only
          'mapToolbar': false     // android only
        },

      };

      try {
        this.map = GoogleMaps.create('map_canvas', options);
        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
          loader.dismiss();
          /*this.myMarker = this.map.addMarkerSync({
            title: 'Usted está aquí.',
            icon: this.myMarkerIcon,
            //animation: 'DROP',
            position: {
              lat: this.latitud,
              lng: this.longitud
            }
          });
          this.myMarker.showInfoWindow();*/
        });
      } catch (e) {
        console.log("could not create map", e);
      };

    });
  }

  locateMe() {
    this.geolocation.getCurrentPosition()
      .then((resp) => {
        try {
          this.myMarker.setPosition({
            lat: resp.coords.latitude,
            lng: resp.coords.longitude
          });
          //https://github.com/mapsplugin/cordova-plugin-googlemaps-doc/blob/master/v1.4.0/class/Map/animateCamera/README.md
          this.map.animateCamera({
            'target': { "lat": resp.coords.latitude, "lng": resp.coords.longitude },
            'bearing': 0, //no camera rotation
            'duration': 500 // = 0.5 sec.
          });
        } catch (e) {
          console.log("error creating setting the myMarker position", e);
        };
      }).catch((error) => {
        console.log('Error w/ getCurrentPosition: ' + JSON.stringify(error), error.code, error.message);
      });
  }

  locateContact(fab: FabContainer) {
    //fab.close();
    const myModal: Modal = this.modalCtrl.create('ContactsListModalPage', null, { cssClass: "modalStyle", enableBackdropDismiss: true });
    myModal.present();

    myModal.onDidDismiss((contactsArray) => {
      if (contactsArray !== null) {
        this.getContactsMarkers(contactsArray);
      }
    });
  }

  getContactsMarkers(contactsArray) {
    const loader = this.loadingCtrl.create({
      content: "Obteniendo ubicaciones..."
    });
    loader.present();
    //if there is already an observable active, we unsubscribe to it, so it stops.
    if (!(this.timerObservable == null)) {
      this.timerObservable.unsubscribe();
      //this may not be needed since we already unsubscribe
      //this.updateMarkersActive = false;
    }
    //and we add our new elements to the array
    this.updateActiveContacts(contactsArray).then(() => {

      //permitimos que se active el timerobservable
      //this.updateMarkersActive = true;
      this.timerObservable = TimerObservable.create(0, this.updateMarkersTimer)
        .takeWhile(() => this.activeContacts.length > 0)
        .subscribe(() => {
          //generamos un array con todos los IDs activos
          let ids = this.activeContacts.map(function (key) {
            return key["id"];
          });
          this.backEnd.getContactsLocation(ids)
            .subscribe((data) => {
              loader.dismiss();
              if (data["code"] === 200 && data["data"].length > 0) {
                this.updateActiveContactsMarkers(data["data"]);
              } else {
                let alert = this.alertCtrl.create({
                  title: data["msg"],
                  buttons: ['Ok']
                });
                alert.present();
              }
            });
        });

    });

  }

  //add new contacts to the active array if they are not already there
  updateActiveContacts(contactsArray) {
    return new Promise((resolve, reject) => {
      Object.keys(contactsArray).forEach(() => {

        let isContactActive = this.activeContacts.some(function (contact) {
          return contact.hasOwnProperty("id") && contact["id"] === contactsArray["id"];
        });

        if (!isContactActive) {
          this.activeContacts.push({
            "id": contactsArray["id"],
            "name": "",
            "device_uid": "",
            "date": "",
            "device_manufacturer": "",
            "device_model": "",
            "image": "",
            "marker": []
          });
        }
      });
      resolve();
    });
  }

  updateActiveContactsMarkers(data) {

    Object.keys(this.activeContacts).forEach((activeIndex) => {

      Object.keys(data).forEach((dataIndex) => {

        if (this.activeContacts[activeIndex]["id"] == data[dataIndex]["id"]) {

          this.activeContacts[activeIndex]["name"] = data[dataIndex]["name"];
          this.activeContacts[activeIndex]["device_uid"] = data[dataIndex]["device_uid"];
          this.activeContacts[activeIndex]["date"] = data[dataIndex]["date"];
          this.activeContacts[activeIndex]["device_manufacturer"] = data[dataIndex]["device_manufacturer"];
          this.activeContacts[activeIndex]["device_model"] = data[dataIndex]["device_model"];
          this.activeContacts[activeIndex]["image"] = data[dataIndex]["image"];

          //si no existe el marcador lo creamos
          if (this.activeContacts[activeIndex]["marker"] === undefined || this.activeContacts[activeIndex]["marker"].length == 0) {
            this.activeContacts[activeIndex]["marker"] = this.generateMarker(data[dataIndex]["lat"], data[dataIndex]["lng"], data[dataIndex]["name"], data[dataIndex]["device_model"], data[dataIndex]["device_manufacturer"], data[dataIndex]["date"]);
          } else {
            //si existe lo actualizamos
            this.moveMarker(activeIndex, data[dataIndex]["lat"], data[dataIndex]["lng"], data[dataIndex]["name"], data[dataIndex]["device_model"], data[dataIndex]["device_manufacturer"], data[dataIndex]["date"]);
            this.activeContacts[activeIndex]["marker"].hideInfoWindow();
          }

        }

      })
    });

  }

  //funcion que crea un marcador para el array de contactos activos
  generateMarker(lat, lng, name, device_model, device_manufacturer, date) {
    let title = name !== null ?
      (name + " " + date) :
      (device_model + "(" + device_manufacturer + ") " + date);

    return this.map.addMarkerSync({
      title: title,
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: lat,
        lng: lng
      }
    });
  }

  //funcion que mueve un marcador para el array de contactos activos
  moveMarker(activeIndex, lat, lng, name, device_model, device_manufacturer, date) {
    let title = name !== null ?
      (name + " " + date) :
      (device_model + "(" + device_manufacturer + ") " + date);

    let pos: ILatLng = {
      lat: lat,
      lng: lng
    }
    this.activeContacts[activeIndex]["marker"].setPosition(pos);
    this.activeContacts[activeIndex]["marker"].setTitle(title);
  }

  //show marker info and centers to it
  showMarkerInfo(activeIndex) {
    this.activeContacts[activeIndex]["marker"].showInfoWindow();

    //let latlng = this.myMarker.getPosition();
    //bounds.push({ "lat": latlng.lat, "lng": latlng.lng });

    this.map.animateCamera({
      'target': this.activeContacts[activeIndex]["marker"].getPosition(),
      //'tilt': 40,   // ignored
      //'zoom': 18,   // ignored
      'bearing': 0,   // ignored
      'duration': 300
    });

  }
  //remove element from active contacts
  removeElement(i) {

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opciones',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Dejar de seguir',
          role: 'destructive',  //will always sort to be on top
          icon: 'remove-circle',
          handler: () => {
            //remove the marker
            this.activeContacts[i]["marker"].remove();
            //remove the contact from active array
            //remove the contact from active array,if i is a string, a + sign converts string key to a number
            this.activeContacts.splice(i, 1);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: 'close',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();

  }

  //remove all markers and contacts from the map
  async removeAllActiveContacts() {
    await Object.keys(this.activeContacts).forEach(async (key) => {
      //remove the marker
      await this.activeContacts[key]["marker"].remove();
    });
    this.activeContacts = [];
  }

  markContact(points) {

    let bounds = [];
    this.activeContacts = [];
    this.markersArray = [];
    for (let i = 0; i < points.length; i++) {
      let marker = this.map.addMarkerSync({
        title: points[i].name,
        icon: 'blue',
        animation: 'DROP',
        position: {
          lat: points[i].lat,
          lng: points[i].lng
        }
      });
      marker.showInfoWindow();

      bounds.push({ "lat": points[i].lat, "lng": points[i].lng });

      this.markersArray[points[i].uid] = marker;

    }

    let latlng = this.myMarker.getPosition();
    bounds.push({ "lat": latlng.lat, "lng": latlng.lng });


    this.map.animateCamera({
      'target': bounds,
      //'tilt': 40,   // ignored
      //'zoom': 18,   // ignored
      'bearing': 0,   // ignored
      'duration': 500
    });

    //this.updateContactsMarkers();

    //setTimeout(() => markersArray["contacto1"].remove(), 10000);
    //setInterval(() => this.moveMarkers(), 500);
    /*this[contacts["device_uid"]].remove();
      const str = "myVar";
      const uid = `${contacts["device_uid"]}`;
      this[str] = "Value";
      this["mark1"] = `${contacts["device_uid"]}`;
      console.log(this.myVar, this.mark1, `${contacts["device_uid"]}`, this[contacts]);
   
      //this.marker.setPosition( { lat: this.lat, lng: this.lng });
   
      this[contacts["device_uid"]] = this.map.addMarkerSync({
        title: 'Contacto.',
        icon: 'blue',
        animation: 'DROP',
        position: {
          lat: -31.731614,
          lng: -60.517711
        }
      });
      this.myMarker.showInfoWindow();*/
  }

  moveMarkers() {
    //arrow function because this.markersArray is not in the foreach context.
    Object.keys(this.markersArray).forEach((key) => {
      let latlng = this.markersArray[key].getPosition();

      let newlat = (Math.random() * ((latlng.lat - 0.000900) - latlng.lat) + latlng.lat).toFixed(6) * 1;
      let newlng = (Math.random() * ((latlng.lng - 0.000900) - latlng.lng) + latlng.lng).toFixed(6) * 1;

      let pos: ILatLng = {
        lat: newlat,
        lng: newlng
      }

      this.markersArray[key].setPosition(pos);
    });
  }

  moveMarkerSlowly() {
    /*this.interval = setInterval(() => {
      pos.lat += 0.01;
      pos.lng += 0.01;
      if (this.marker !== undefined) {
        this.marker.setPosition(pos);
      }
    }, 3000);*/
  }










  /*
    geolocationNative() {
      console.log("hola");
      this.geolocation.getCurrentPosition().then((resp) => {
  
        this.fdb.list('/puntos/').push({
          "lat": resp.coords.latitude,
          "lng": resp.coords.longitude,
          "date": firebase.database.ServerValue.TIMESTAMP
        });
  
        console.log("GPS request",
            new Date().toLocaleDateString("es-AR", {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          );
        //this.latitud = resp.coords.latitude;
        //this.longitud = resp.coords.longitude;
        //console.log("geolocationNative, posicion actual:", resp.coords.latitude, resp.coords.longitude);
      }).catch((error) => {
        console.log('Error w/ getCurrentPosition: ' + JSON.stringify(error), error.code, error.message);
      });
    }
  
    
    startTracking() {
      this.isTracking = true;
      this.trackedRoute = [];
  
      this.geolocationNative();
      this.add = setInterval(() => {
        this.geolocationNative();
      }, 300000);
    }
  
    stopTracking() {
      clearInterval(this.add);
      //let newRoute = { finished: new Date().getTime(), path: this.trackedRoute };
      //this.previousTracks.push(newRoute);
      //this.storage.set('routes', this.previousTracks);
  
      this.isTracking = false;
      //this.positionSubscription = null;
      //this.positionSubscription.unsubscribe();  //se deja de actualizar los datos en variable automaticamente
      //this.currentMapTrack.setMap(null);  //limpiamos el mapa
      this.map.clear();  //limpiamos el mapa
      this.redrawPath();
    }
  
    redrawPath() {
      //apartamos el ultimo elemento para distinguirlo
      let ultimo = this.arrDatos[this.arrDatos.length - 1];
      let jsonLine = [];
      this.arrDatos.forEach((value, index) => {
        jsonLine.push({
          lat: value.lat,
          lng: value.lng
        });
        this.addAMark(value.lat, value.lng, value.date, true);
      });
  
      this.map.addPolyline({
        points: jsonLine,
        color: '#AA00FF',
        width: 5,
        geodesic: true,
        clickable: false  // clickable = false in default
      });
    }
  
    addAMark(lat, lng, title, info = false) {
      try {
        let marker: Marker = this.map.addMarkerSync({
          title: title,
          icon: 'blue',
          animation: 'DROP',
          position: {
            lat: lat,
            lng: lng
          }
        });
        if (info) {
          marker.showInfoWindow();
        }
      } catch (e) {
        console.log(e); // Can not get location, permission refused, and so on...
      };
    }
  }
      /*
      this.fdb.list('/puntos/').valueChanges().subscribe(data => {
        this.arrDatos = data;
        console.log(this.arrDatos);
      }, (err) => { console.log("Revisar este error : ", err) });
      */

  /*this.fdb.list('/puntos/', ref => ref.limitToLast(5).orderByChild("date"))
    .valueChanges()
    .subscribe(data => {
      this.arrDatos = data;
      console.log(this.arrDatos);
    }, (err) => { console.log("Revisar este error : ", err) });*/


  /*this.itemsRef = fdb.list('puntos', ref => ref.limitToLast(5).orderByChild("date"));
  //itemsRef.remove(); //borramos toda la lista de datos
  this.itemsRef.snapshotChanges()
    .subscribe(actions => {
      actions.forEach(action => {
        console.log("snapshotchanges", action);
        //console.log("Type", action.type);
        //console.log("Key", action.key);
        //var d = new Date(action.payload.val().date);
        //console.log("Payload.val().date", d.toLocaleDateString("es-AR"));//d.getDate() + "/" + d.getMonth()+1 + "/" + d.getFullYear() + " "   );
        //console.log("Payload.val().lat", action.payload.val().lat);
        //console.log("Payload.val().lng", action.payload.val().lng);
      });
    });*/

  /*try {
    this.positionSubscription = this.geolocation.watchPosition({
      maximumAge: this.intervaloTiempo,
      timeout: this.intervaloTiempo,
      enableHighAccuracy: true
    }).subscribe(position => {
      this.latitud = position.coords.latitude;
      this.longitud = position.coords.longitude;
      this.fdb.list('puntos').push({
        "lat": position.coords.latitude,
        "lng": position.coords.longitude,
        "date": firebase.database.ServerValue.TIMESTAMP
      });
      console.log("GPS request",
        new Date().toLocaleDateString("es-AR", {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    }, (error) => {
      console.log(error);
    });
  } catch (error) {
    console.log(error);
  }*/

  //los cambios en el gps se van repercutiendo automaticamente en positionsubscription
  /*this.positionSubscription = this.geolocation.watchPosition()
    .subscribe(position => {
      setTimeout(() => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        this.fdb.list('/puntos/').push({
          "lat": position.coords.latitude,
          "lng": position.coords.longitude,
          "date": firebase.database.ServerValue.TIMESTAMP
        });
        console.log("GPS request",
          new Date().toLocaleDateString("es-AR", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
      }, 300000);
    });*/


}