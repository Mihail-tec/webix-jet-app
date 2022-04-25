import {JetView} from "webix-jet";

import activities from "../models/activitiesDB";
import activitiesTypes from "../models/activityTypesDB";
import contacts from "../models/contactsDB";

export default class Popup extends JetView {
	config() {
		return {
			view: "form",
			localId: "form",
			elements: [
				{
					view: "textarea",
					name: "Details",
					label: "Details",
					width: 600,
					height: 100
				},
				{
					view: "richselect",
					name: "TypeID",
					label: "Type",
					options: activitiesTypes,
					required: true,
					invalidMessage: "Filed required"
				},
				{
					view: "richselect",
					name: "ContactID",
					label: "Contact",
					options: contacts,
					required: true,
					invalidMessage: "Filed required"
				},
				{
					cols: [
						{
							view: "datepicker",
							label: "Date",
							name: "Date",
							width: 250
						},
						{
							view: "datepicker",
							type: "time",
							label: "Time",
							name: "Time",
							width: 250,
							suggest: {
								type: "timeboard",
								body: {
									button: true
								}
							}
						}
					]
				},
				{
					view: "checkbox",
					name: "State",
					labelRight: "Completed",
					labelWidth: 0,
					checkValue: "Close",
					uncheckValue: "Open"
				},
				{
					cols: [
						{},
						{
							view: "button",
							value: "Add",
							localId: "addClick",
							css: "webix_primary",
							click: () => this.save()
						},
						{
							view: "button",
							value: "Cancel",
							click: () => this.hideWindow()
						}
					]
				}
			],
			rules: {
				TypeID: webix.rules.isNotEmpty,
				ContactID: webix.rules.isNotEmpty
			}
		};
	}

	init() {
		this.on(this.app, "setDataForm", data => this.setDataForm(data));
		this.form = this.$$("form");
		this.addClick = this.$$("addClick");
	}

	setDataForm(data) {
		this.addClick.setValue("Save");
		if (data.DueDate) {
			const dateAndTime = this.strToDate(data.DueDate);
			data.Date = dateAndTime;
			data.Time = dateAndTime;
		}
		this.form.clearValidation();
		this.form.setValues(data);
	}

	save() {
		if (!this.form.validate()) {
			return;
		}
		const posting = this.form.getValues();
		posting.DueDate = this.dateToStr(posting);
		if (posting.id) {
			activities.updateItem(posting.id, posting);
		}
		else {
			activities.add(posting);
		}
		this.hideWindow();
	}

	hideWindow() {
		this.getParentView().hideWindow();
		this.addClick.setValue("Add");
		this.form.clear();
		this.form.clearValidation();
	}

	dateToStr(posting) {
		const formatDate = webix.Date.dateToStr("%Y-%m-%d");
		const formatTime = webix.Date.dateToStr("%H:%i");
		const date = formatDate(
			posting.Date || new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
		);
		const time = posting.Time ? formatTime(posting.Time) : "09:00";
		return `${date} ${time}`;
	}

	strToDate(str) {
		const parser = webix.Date.strToDate("%d-%m-%Y %H:%i");
		const date = parser(str);
		return date;
	}
}