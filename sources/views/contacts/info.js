import {JetView} from "webix-jet";

import activities from "../../models/activitiesDB";
import contacts from "../../models/contactsDB";
import statuses from "../../models/statusesDB";

export default class Info extends JetView {
	config() {
		const contactInfo = {
			localId: "contactsDetails",
			rows: [
				{
					cols: [
						{
							localId: "infoTitle",
							view: "template",
							autoheight: true,
							padding: 10,
							template: ({FirstName, LastName}) => `${FirstName} ${LastName}`
						},
						{},
						{
							view: "button",
							label: "Delete",
							width: 100,
							type: "icon",
							icon: "far fa-trash-alt",
							click: () => this.delete()
						},
						{
							view: "button",
							label: "Edit",
							width: 100,
							type: "icon",
							icon: "far fa-edit",
							click: () => {
								this.show(`contacts.contactForm?id=${this.id}`);
							}
						}
					]
				},
				{
					localId: "infoMain",
					view: "template",
					template: this.infoTemplate()
				}
			]
		};

		return {
			rows: [contactInfo]
		};
	}

	init() {
		this.infoMain = this.$$("infoMain");
		this.infoTitle = this.$$("infoTitle");
		this.join();
	}

	urlChange() {
		this.id = this.getParam("contactsId", true);
		if (this.id) {
			this.join();
		}
	}

	join() {
		webix.promise.all([
			activities.waitData,
			contacts.waitData
		])
			.then(() => {
				const contact = contacts.getItem(this.id);
				if (contact) {
					this.infoMain.parse(contact);
					this.infoTitle.parse(contact);
				}
			});
	}

	delete() {
		this.webix.confirm("Are you sure?").then(() => {
			contacts.remove(this.id);
			this.app.callEvent("select");
		});
	}

	infoTemplate() {
		const infoTemplate = ({
			Photo,
			Email,
			Skype,
			Job,
			Company,
			Birthday,
			Address,
			StatusID
		}) => {
			const photo = Photo || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Breezeicons-actions-22-im-user.svg/1200px-Breezeicons-actions-22-im-user.svg.png";
			const status = statuses.getItem(StatusID);
			return `
			<div class="info">
				<div class="info_block">
					<div class="info_photo">
						<img src=${photo} alt="photo">
					</div>

					<div class="info_status">
						<span class="status-name">
						${status ? `${status.Icon}` : "no status"}
						</span>
						<span class='fas fa-${status ? `${status.Value}` : "no status"}'></span>
					</div>
				</div>


				<div class="info_items">
					<div class="info_item">
						<span class="fas fa-envelope"></span>
						<span>Email: ${Email || "no email"}</span>
					</div>

					<div class="info_item">
						<span class="fab fa-skype"></span>
						<span>Skype: ${Skype || "no skype"}</span>
					</div>

					<div class="info_item">
						<span class="fas fa-tag"></span>
						<span>Job: ${Job || "no job"}</span>
					</div>

					<div class="info_item">
						<span class="fas fa-briefcase"></span>
						<span>Company: ${Company || "no company"}</span>
					</div>

					<div class="info_item">
						<span class="far fa-calendar-alt"></span>
						<span>Date of birth: ${webix.Date.dateToStr("%d %M %Y")(Birthday) || "no birthday"}</span>
					</div>

					<div class="info_item">
						<span class="fas fa-map-marker-alt"></span>
						<span>Location: ${Address || "no address"}</span>
					</div>
				</div>
			</div>
		`;
		};
		return infoTemplate;
	}
}
