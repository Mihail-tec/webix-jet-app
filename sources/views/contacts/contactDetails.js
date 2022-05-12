import {JetView} from "webix-jet";

import activitiesPopup from "../activitiesPopup";
import ActivitiesTable from "../activitiesTable";
import FilesTable from "../filesTable";
import Info from "./info";

export default class ContactDetailView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const tabbar = {
			view: "tabbar",
			multiview: true,
			value: "activities",
			options: [
				{id: "activities", value: _("Activities")},
				{id: "files", value: _("Files")}
			]
		};

		const activitiesTable = new ActivitiesTable(this.app, true, true);
		const addBtnAct = {
			view: "button",
			label: _("Add activity"),
			type: "icon",
			icon: "fas fa-plus-square",
			width: 200,
			click: () => {
				this.window.showWindow();
			}
		};

		const cell = {
			cells: [
				{
					id: "activities",
					rows: [
						{$subview: activitiesTable},
						{cols: [
							{},
							addBtnAct
						]}
					]
				},
				{id: "files", $subview: FilesTable}
			]
		};

		return {
			rows: [Info, tabbar, cell]
		};
	}

	init() {
		this.window = this.ui(activitiesPopup);
	}
}
