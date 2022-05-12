import {JetView} from "webix-jet";

export default class Empty extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		return {
			rows: [
				{
					template: _("For the application to work correctly, add a user by clicking button 'AddContact' ")
				}
			]
		};
	}
}

