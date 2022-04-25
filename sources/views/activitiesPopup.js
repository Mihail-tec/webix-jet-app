import {JetView} from "webix-jet";

import Popup from "./popup";

export default class ActivitiesPopup extends JetView {
	config() {
		return {
			view: "window",
			modal: true,
			localId: "activitiesPopup",
			position: "center",
			head: "Add activity",
			body: Popup
		};
	}

	showWindow(data) {
		if (data) {
			this.changeHead("Edit");
			this.setDataForm(data);
		}
		this.getRoot().show();
	}

	changeHead(title = "Add") {
		this.$$("activitiesPopup").getHead().setHTML(`${title} activity`);
	}

	hideWindow() {
		this.getRoot().hide();
		this.changeHead();
	}

	setDataForm(data) {
		this.app.callEvent("setDataForm", [data]);
	}
}
