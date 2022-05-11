import {JetView} from "webix-jet";

import activities from "../models/activitiesDB";
import activitiesTypes from "../models/activityTypesDB";
import contacts from "../models/contactsDB";

export default class ActivitiesPopup extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		return {
			view: "window",
			modal: true,
			localId: "activitiesPopup",
			position: "center",
			head: _("Add activity"),
			body: {
				view: "form",
				localId: "form",
				elements: [
					{
						view: "textarea",
						name: "Details",
						label: _("Details"),
						width: 600,
						height: 100
					},
					{
						view: "richselect",
						name: "TypeID",
						label: _("Type"),
						options: activitiesTypes,
						invalidMessage: _("Field required")
					},
					{
						view: "richselect",
						name: "ContactID",
						localId: "ContactID",
						label: _("Contact"),
						options: contacts,
						invalidMessage: _("Field required")
					},
					{
						cols: [
							{
								view: "datepicker",
								label: _("Date"),
								name: "Date",
								width: 250
							},
							{
								view: "datepicker",
								type: "time",
								label: _("Time"),
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
						labelRight: _("Completed"),
						labelWidth: 0,
						checkValue: "Close",
						uncheckValue: "Open"
					},
					{
						cols: [
							{},
							{
								view: "button",
								value: _("Add"),
								localId: "addClick",
								css: "webix_primary",
								click: () => this.save()
							},
							{
								view: "button",
								value: _("Cancel"),
								click: () => this.hideWindow()
							}
						]
					}
				],
				rules: {
					TypeID: webix.rules.isNotEmpty,
					ContactID: webix.rules.isNotEmpty
				}
			}
		};
	}

	init() {
		this.activitiesPopup = this.$$("activitiesPopup");
		this.form = this.$$("form");
		this.addClick = this.$$("addClick");
		this.ContactID = this.$$("ContactID");
	}

	save() {
		if (!this.form.validate()) {
			return;
		}
		const posting = this.form.getValues();
		posting.DueDate = this.dateToStr(posting);
		posting.ContactID = parseInt(posting.ContactID);
		if (posting.id) {
			activities.updateItem(posting.id, posting);
		}
		else {
			activities.add(posting);
		}
		this.hideWindow();
	}

	hideWindow() {
		this.getRoot().hide();
		this.form.clear();
		this.form.clearValidation();
	}

	showWindow(id) {
		const _ = this.app.getService("locale")._;
		this.getRoot().show();
		const contactId = this.getParam("contactsId", true);

		if (!id && contactId) {
			this.form.setValues({ContactID: contactId});
			this.ContactID.disable();
		}
		if (id) {
			this.form.setValues(activities.getItem(id));
			this.activitiesPopup.getHead().setHTML(_("Edit activity"));
			this.addClick.setValue(_("Save"));
			this.ContactID.disable();
		}
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
