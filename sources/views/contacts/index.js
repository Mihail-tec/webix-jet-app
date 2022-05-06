import {JetView} from "webix-jet";

import ListView from "./list";

import "../../styles/contacts.css";

export default class Contacts extends JetView {
	config() {
		return {
			type: "clean",
			cols: [
				ListView,
				{
					$subview: true
				}
			]
		};
	}
}
