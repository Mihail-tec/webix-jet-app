import {JetView} from "webix-jet";

import activities from "../models/activitiesDB";
import activitiesTypes from "../models/activityTypesDB";
import contacts from "../models/contactsDB";
import activitiesPopup from "./activitiesPopup";

export default class Activities extends JetView {
	config() {
		return this.webix.promise.all([
			contacts.waitData,
			activitiesTypes.waitData,
			activities.waitData
		]).then(() => {
			const table = {
				view: "datatable",
				localId: "datatable",
				select: "row",
				minWidth: 700,
				data: activities,
				columns: [
					{
						id: "State",
						header: "",
						sort: "text",
						template: "{common.checkbox()}",
						checkValue: "Close",
						uncheckValue: "Open"

					},
					{
						id: "TypeID",
						header: ["Activity type", {content: "selectFilter"}],
						sort: "text",
						width: 200,
						options: activitiesTypes
					},
					{
						id: "DueDate",
						header: ["Due data", {content: "datepickerFilter",
							inputConfig: {format: webix.Date.dateToStr("%Y-%m-%d")},
							compare(cell, filter) {
								const dateCell = webix.Date.dayStart(cell).getTime();
								const dateFilter = webix.Date.dayStart(filter).getTime();
								return dateCell === dateFilter;
							}
						}],
						sort: "date",
						width: 200,
						format: webix.Date.dateToStr("%Y-%m-%d %H:%i")
					},
					{
						id: "Details",
						header: ["Details", {content: "textFilter"}],
						sort: "text",
						fillspace: true
					},
					{
						id: "ContactID",
						header: ["ContactID", {content: "selectFilter"}],
						options: contacts,
						width: 200,
						sort: "text"
					},
					{
						header: "",
						width: 50,
						template: "<span class='far fa-edit edit'></span>"
					},
					{
						header: "",
						width: 50,
						template: "<span class='far fa-trash-alt delete'></span>"
					}
				],
				onClick: {
					edit: (e, id) => {
						const getId = this.table.getItem(id);
						this.window.showWindow(getId);
					},
					delete: (e, id) => {
						webix.confirm("Are you sure?").then(() => {
							activities.remove(id);
						});
					}
				},
				on: {
					onAfterSelect: (id) => {
						this.show(`/top/activities?id=${id}`);
					}
				}

			};

			const addBtn = {
				view: "button",
				label: "Add activity",
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
					table
				]
			};
		});
	}

	init() {
		this.window = this.ui(activitiesPopup);
		this.table = this.$$("datatable");
		this.table.parse(activities);

		this.on(activities.data, "onStoreUpdated", (id) => {
			if (id) {
				this.table.filterByAll();
			}
		});
	}
}
