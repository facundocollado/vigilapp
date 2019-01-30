import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
//animations for lists
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//modules
import { HomePage } from '../pages/home/home';
import { ConfigurationsPage } from '../pages/configurations/configurations';
import { ContactsPage } from '../pages/contacts/contacts';
import { TabsPage } from '../pages/tabs/tabs';
//ionic native startup
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
//pluggins
import { Firebase } from '@ionic-native/firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps } from '@ionic-native/google-maps';
import { SQLite } from '@ionic-native/sqlite';
import { Device } from '@ionic-native/device';
import { BackgroundMode } from '@ionic-native/background-mode';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Network } from '@ionic-native/network';
//providers
import { FcmProvider } from '../providers/fcm/fcm';
import { BackactProvider } from '../providers/backact/backact';
import { ConfJsonProvider } from '../providers/conf-json/conf-json';
import { BackEndProvider } from '../providers/back-end/back-end';
import { NetworkServiceProvider } from '../providers/network-service/network-service';
//components
import { ComponentsModule } from '../components/components.module';
//pages
import { ContactsListModalPageModule } from '../pages/contacts-list-modal/contacts-list-modal.module';

// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCT-DfeBuHbhojKH5M-tOYcBYHUuTM9dBA",
  authDomain: "ionic-maps-212823.firebaseapp.com",
  databaseURL: "https://ionic-maps-212823.firebaseio.com",
  projectId: "ionic-maps-212823",
  storageBucket: "ionic-maps-212823.appspot.com",
  messagingSenderId: "1088287454569"
};

@NgModule({
  declarations: [
    MyApp,
    ConfigurationsPage,
    HomePage,
    ContactsPage,
    TabsPage,
    //ContactsListComponent,
    //PendingListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,  //animation
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    ComponentsModule,
    ContactsListModalPageModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ConfigurationsPage,
    HomePage,
    ContactsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Firebase,
    FcmProvider,
    Geolocation,
    GoogleMaps,
    Device,
    BackgroundMode,
    BackactProvider,
    SQLite,
    ConfJsonProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    BackEndProvider,
    SocialSharing,
    Network,
    NetworkServiceProvider
  ]
})
export class AppModule { }
