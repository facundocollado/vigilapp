import { Component } from '@angular/core';

import { ConfigurationsPage } from '../configurations/configurations';
import { HomePage } from '../home/home';
import { ContactsPage } from '../contacts/contacts';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ContactsPage;
  tab3Root = ConfigurationsPage;

  constructor() {

  }
}
