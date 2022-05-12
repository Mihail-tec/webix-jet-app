import {JetView} from "webix-jet";

import activities from "../../models/activitiesDB";
import contacts from "../../models/contactsDB";
import statuses from "../../models/statusesDB";

export default class ListView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;

		const filterContacts = {
			view: "text",
			localId: "filterContacts",
			placeholder: _("Find contact"),
			on: {
				onTimedKeyPress: () => {
					this.filterList();
				}
			}
		};

		const list = {
			view: "list",
			localId: "list",
			width: 300,
			select: true,
			template: ({Photo, FirstName, LastName, Email}) => {
				const photo =
			Photo ||
			"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Breezeicons-actions-22-im-user.svg/1200px-Breezeicons-actions-22-im-user.svg.png";
				return `
					<div class="contact_item"> 
						<div class="contact_photo">
							<img src= ${photo}>
						</div>
						<div class="contact_name"> 
							<div>${FirstName} ${LastName} </div>
							<div>${Email || _("no email")} </div>
						</div>
					</div>
				`;
			},
			on: {
				onSelectChange: () => {
					const id = this.list.getSelectedId();
					if (id) {
						this.setParam("contactsId", id, true);
						this.show("contacts.contactDetails");
					}
					else {
						this.setParam("contactsId", null, true);
					}
				}
			}
		};

		const addBtnContact = {
			view: "button",
			label: _("Add Contact"),
			type: "icon",
			icon: "fas fa-plus-square",
			click: () => {
				this.list.unselectAll();
				this.show("contacts.contactForm");
			}
		};

		return {
			rows: [filterContacts, list, addBtnContact]
		};
	}

	init() {
		const _ = this.app.getService("locale")._;
		this.list = this.$$("list");
		this.filterContacts = this.$$("filterContacts");
		this.on(this.app, "select", (id) => {
			this.list.unselectAll();
			this.filterList();
			if (id) {
				this.list.select(id);
			}
			else {
				const firstId = this.list.getFirstId();
				if (firstId) {
					this.list.select(firstId);
				}
				else {
					webix.alert(_("Click button 'Add contact' "));
					this.show("/top/contacts/contacts.empty");
				}
			}
		});

		webix.promise
			.all([contacts.waitData, statuses.waitData, activities.waitData])
			.then(() => {
				this.list.sync(contacts);
				this.list.select(this.list.getFirstId());
			});
	}

	filterList() {
		const text = this.filterContacts.getValue().toLowerCase().trim();

		if (text != null && typeof text !== "undefined") {
			this.list.filter((obj) => {
				const isFound = Object.entries(obj)
					.filter(([key, value]) => (key !== "Phone" || key !== "StatusID") && typeof value === "string")
					.find(([, value]) => value.toLowerCase().indexOf(text) !== -1);
				if (isFound) {
					return true;
				}
				if (obj.Phone === text) {
					return true;
				}

				if (obj.StatusID) {
					const status = statuses.getItem(obj.StatusID);
					if (status) {
						return status.Value.toLowerCase().indexOf(text) !== -1;
					}
				}
				return false;
			});
		}
		else {
			this.list.filter();
		}
	}
}

