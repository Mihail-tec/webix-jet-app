import {JetView} from "webix-jet";

import activities from "../../models/activitiesDB";
import contacts from "../../models/contactsDB";
import statuses from "../../models/statusesDB";

export default class ListView extends JetView {
	config() {
		const list = {
			view: "list",
			localId: "list",
			width: 300,
			select: true,
			template: ({Photo, FirstName, LastName, Email}) => {
				const photo = Photo || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Breezeicons-actions-22-im-user.svg/1200px-Breezeicons-actions-22-im-user.svg.png";
				return `
					<div class="contact_item"> 
						<div class="contact_photo">
							<img src= ${photo}>
						</div>
						<div class="contact_name"> 
							<div>${FirstName} ${LastName} </div>
							<div>${Email || "no email"} </div>
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
			label: "Add Contact",
			type: "icon",
			icon: "fas fa-plus-square",
			click: () => {
				this.list.unselectAll();
				this.show("contacts.contactForm");
			}

		};

		return {
			rows: [
				list,
				addBtnContact
			]
		};
	}

	init() {
		this.list = this.$$("list");
		this.on(this.app, "select", (id) => {
			this.list.unselectAll();
			if (id) {
				this.list.select(id);
			}
			else {
				const firstId = this.list.getFirstId();
				if (firstId) {
					this.list.select(firstId);
				}
				else {
					webix.alert("Click button 'Add contact' ");
					this.show("/top/contacts/contacts.empty");
				}
			}
		});


		webix.promise.all([
			contacts.waitData,
			statuses.waitData,
			activities.waitData
		]).then(() => {
			this.list.sync(contacts);
			this.list.select(this.list.getFirstId());
		});
	}
}
