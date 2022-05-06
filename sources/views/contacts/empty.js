import {JetView} from "webix-jet";

export default class Empty extends JetView {
	config() {
		return {
			rows: [
				{
					template: "For the application to work correctly, add a user by clicking button 'AddContact' "
				}
			]
		};
	}
}

