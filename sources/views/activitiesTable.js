import {JetView} from "webix-jet";

import activities from "../models/activitiesDB";
import activitiesTypes from "../models/activityTypesDB";
import contacts from "../models/contactsDB";
import activitiesPopup from "./activitiesPopup";


export default class ActivityTable extends JetView {
	constructor(app, hideColumn, hideTabbar) {
		super(app);
		this.hideColumn = hideColumn;
		this.hideTabbar = hideTabbar;
	}

	config() {
		const _ = this.app.getService("locale")._;
		return this.webix.promise.all([
			contacts.waitData,
			activitiesTypes.waitData,
			activities.waitData
		]).then(() => {
			const tabbar = {
				view: "tabbar",
				localId: "tabbar",
				hidden: this.hideTabbar,
				value: "all",
				options: [
					{id: "all", value: _("All")},
					{id: "overdue", value: _("Overdue")},
					{id: "completed", value: _("Completed")},
					{id: "today", value: _("Today")},
					{id: "tomorrow", value: _("Tomorrow")},
					{id: "thisWeek", value: _("This week")},
					{id: "thisMonth", value: _("This month")}
				],
				on: {
					onChange: (id) => {
						this.table.filterByAll();
						this.filterTabbar(id);
					}
				}
			};

			const table = {
				view: "datatable",
				localId: "datatable",
				select: "row",
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
						header: [_("Activity type"), {content: "selectFilter"}],
						sort: "text",
						width: 200,
						options: activitiesTypes
					},
					{
						id: "DueDate",
						header: [_("Due data"), {content: "datepickerFilter",
							compare: this.dateCompare
						}],
						sort: "date",
						width: 200,
						format: webix.Date.dateToStr("%Y-%m-%d %H:%i")
					},
					{
						id: "Details",
						header: [_("Details"), {content: "textFilter"}],
						sort: "text",
						fillspace: true,
						minWidth: 200
					},
					{
						id: "ContactID",
						hidden: this.hideColumn,
						header: [_("ContactID"), {content: "selectFilter"}],
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
						webix.confirm(_("Are you sure you want to delete?")).then(() => {
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
							this.table.filter("#ContactID#", this.contactId, true);
						}
						this.filterTabbar(this.tabbar.getValue());
					}
				}
			};

			return {
				rows: [
					tabbar,
					table
				]
			};
		});
	}

	init() {
		this.window = this.ui(activitiesPopup);
		this.table = this.$$("datatable");
		this.tabbar = this.$$("tabbar");
		this.table.sync(activities);

		this.on(activities.data, "onStoreUpdated", () => {
			this.table.filterByAll();
		});
	}

	urlChange() {
		this.contactId = this.getParam("contactsId", true);
		if (this.contactId) {
			this.table.filterByAll();
			this.table.filter("#ContactID#", this.contactId, true);
		}
	}

	dateCompare(cell, filter) {
		const dateCell = webix.Date.dayStart(cell).getTime();
		const dateFilter = webix.Date.dayStart(filter).getTime();
		return webix.Date.equal(dateCell, dateFilter);
	}

	thisMonth(start, end) {
		return start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth();
	}

	filterTabbar(id) {
		const todayDateTime = Date.now();
		const todayDate = webix.Date.dayStart(Date.now());

		const filters = {
			overdue: (obj) => {
				if (!obj.DueDate) return false;
				return obj.State === "Open" && obj.DueDate.getTime() < todayDateTime;
			},
			completed: obj => obj.State === "Close",
			today: (obj) => {
				if (!obj.DueDate) return false;
				const date = webix.Date.dayStart(obj.DueDate);
				return webix.Date.equal(date, todayDate);
			},
			tomorrow: (obj) => {
				if (!obj.DueDate) return false;
				const date = webix.Date.dayStart(obj.DueDate);
				const oneDay = webix.Date.add(todayDate, 1, "day", true);
				const tomorrow = webix.Date.dayStart(oneDay);
				return webix.Date.equal(date, tomorrow);
			},
			thisWeek: (obj) => {
				if (!obj.DueDate) return false;
				const dateWeek = webix.Date.weekStart(todayDate);
				const monday = webix.Date.add(dateWeek, 1, "day", true);
				const sunday = webix.Date.add(dateWeek, 7, "day", true);
				return monday <= obj.DueDate && obj.DueDate <= sunday;
			},
			thisMonth: (obj) => {
				if (!obj.DueDate) return false;
				return this.thisMonth(todayDate, obj.DueDate);
			}
		};

		this.table.filter(filters[id], "", true);
	}
}
