import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackEndProvider } from '../../../providers/back-end/back-end';

@IonicPage()
@Component({
    selector: 'page-contacts-add-code',
    templateUrl: 'contacts-add-code.html',
})
export class ContactsAddCodePage {

    contactAddForm: FormGroup;
    submitAttempt: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public backEnd: BackEndProvider,
        private alertCtrl: AlertController) {
        //You can use the following regular expression to check if a string is base64 encoded or not:
        //^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$
        //In base64 encoding, the character set is [A-Z, a-z, 0-9, and + /]. If the rest length is less than 4, the string is padded with '=' characters.
        //^([A-Za-z0-9+/]{4})* means the string starts with 0 or more base64 groups.
        //([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$ means the string ends in one of three forms: [A-Za-z0-9+/]{4}, [A-Za-z0-9+/]{3}= or [A-Za-z0-9+/]{2}==.

        this.contactAddForm = formBuilder.group({
            //name: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            code: ['', Validators.compose([Validators.pattern('^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$'), Validators.required])]
        });
    }

    ionViewDidLoad() { }

    // convenience getter for easy access to form fields
    //get name() { return this.contactAddForm.get('name'); }
    get code() { return this.contactAddForm.get('code'); }

    addContact() {
        this.submitAttempt = false;
        if (!this.contactAddForm.valid) {
            this.submitAttempt = true;
            //this.signupSlider.slideTo(0);
        }
        else {
            const loader = this.loadingCtrl.create({
                content: "Enviando invitaci&oacute;n..."
            });
            loader.present();
            this.backEnd.addContactByCode(this.contactAddForm.value["code"]) //
                .then(data => {
                    loader.dismiss();
                    if (data["code"] === 200) {
                        let alert = this.alertCtrl.create({
                            title: data["msg"],
                            //subTitle: data["msg"],
                            //message: data["msg"],
                            buttons: ['Ok']
                        });
                        alert.present();
                    }
                    console.log("data del backend", data);

                })
                .catch(error => {
                    console.log("error del backend", error);
                    loader.dismiss();
                });
        }
    }
    //MTBiOTZiNTdlOTEzZDM2Nw==

}
