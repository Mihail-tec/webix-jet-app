import {JetView} from "webix-jet";

import activitiesPopup from "./activitiesPopup";
import activitiesTable from "./activitiesTable";

export default class Activities extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const addBtn = {
			view: "button",
			label: _("Add activity"),
			type: "icon",
			icon: "fas fa-plus-square",
			width: 200,
			click: () => {
				this.window.showWindow();
			}
		};

		return {
			rows: [
				{
					cols: [
						{},
						addBtn
					]
				},
				activitiesTable
			]
		};
	}

	init() {
		this.window = this.ui(activitiesPopup);
	}
}
