import {JetView} from "webix-jet";

import activities from "../models/activitiesDB";
import activitiesTypes from "../models/activityTypesDB";
import contacts from "../models/contactsDB";
import activitiesPopup from "./activitiesPopup";


export default class ActivityTable extends JetView {
	constructor(app, hideColumn) {
		super(app);
		this.hideColumn = hideColumn;
	}

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
							compare: this.dateCompare
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
						hidden: this.hideColumn,
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
						this.window.showWindow(id);
					},
					delete: (e, id) => {
						webix.confirm("Are you sure?").then(() => {
							activities.remove(id);
						});
					}
				},
				on: {
					onAfterSelect: (id) => {
						this.setParam("id", id, true);
					},
					onAfterFilter: () => {
						if (this.contactId) {
							this.getRoot().filter("#ContactID#", this.contactId, true);
						}
					}
				}
			};

			return table;
		});
	}

	init() {
		this.window = this.ui(activitiesPopup);
		this.table = this.$$("datatable");
		this.table.sync(activities);
		this.on(activities.data, "onStoreUpdated", (id) => {
			if (id) {
				this.table.filterByAll();
			}
		});

		const processor = webix.dp(activities);
		if (processor) {
			processor.attachEvent("onBeforeDataSend", (details) => {
				details.data.DueDate = webix.Date.dateToStr("%Y-%m-%d %H:%i")(details.data.DueDate);
			});
		}
	}

	urlChange() {
		this.contactId = this.getParam("contactsId", true);
		if (this.contactId) {
			this.table.filterByAll();
			this.table.filter(obj => obj.ContactID === Number(this.contactId));
		}
	}

	dateCompare(cell, filter) {
		const dateCell = webix.Date.dayStart(cell).getTime();
		const dateFilter = webix.Date.dayStart(filter).getTime();
		return webix.Date.equal(dateCell, dateFilter);
	}
}
