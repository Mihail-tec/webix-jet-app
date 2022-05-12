import {JetView} from "webix-jet";

import activities from "../../models/activitiesDB";
import contacts from "../../models/contactsDB";
import statuses from "../../models/statusesDB";

export default class Info extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
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
							template: ({FirstName, LastName}) => `${FirstName || _("no FirstName")} ${LastName || _("no LastName")}`
						},
						{},
						{
							view: "button",
							label: _("Delete"),
							width: 200,
							type: "icon",
							icon: "far fa-trash-alt",
							click: () => this.delete()
						},
						{
							view: "button",
							label: _("Edit"),
							width: 200,
							type: "icon",
							icon: "far fa-edit",
							click: () => {
								this.show("contacts.contactForm");
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
	}

	urlChange() {
		this.contactsId = this.getParam("contactsId", true);
		if (this.contactsId) {
			this.showDataContact();
		}
	}

	showDataContact() {
		webix.promise.all([
			activities.waitData,
			contacts.waitData
		])
			.then(() => {
				const contact = contacts.getItem(this.contactsId);
				if (contact) {
					this.infoMain.parse(contact);
					this.infoTitle.parse(contact);
				}
			});
	}

	delete() {
		const _ = this.app.getService("locale")._;
		this.webix.confirm(_("Are you sure you want to delete?")).then(() => {
			contacts.remove(this.contactsId);
			activities.data.each((obj) => {
				if (Number(obj.ContactID) === Number(this.contactsId)) {
					activities.remove(obj.id);
				}
			});
			this.app.callEvent("select");
		});
	}

	infoTemplate() {
		const _ = this.app.getService("locale")._;
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
						${status ? `${status.Icon}` : _("no status")}
						</span>
						<span class='fas fa-${status ? `${status.Value}` : _("no status")}'></span>
					</div>
				</div>


				<div class="info_items">
					<div class="info_item">
						<span class="fas fa-envelope"></span>
						<span>${_("Email")}: ${Email || _("no email")}</span>
					</div>

					<div class="info_item">
						<span class="fab fa-skype"></span>
						<span>${_("Skype")}: ${Skype || _("no skype")}</span>
					</div>

					<div class="info_item">
						<span class="fas fa-tag"></span>
						<span>${_("Job")}: ${Job || _("no job")}</span>
					</div>

					<div class="info_item">
						<span class="fas fa-briefcase"></span>
						<span>${_("Company")}: ${Company || _("no company")}</span>
					</div>

					<div class="info_item">
						<span class="far fa-calendar-alt"></span>
						<span>${_("Date of birth")}: ${webix.Date.dateToStr("%d %M %Y")(Birthday) || _("no birthday")}</span>
					</div>

					<div class="info_item">
						<span class="fas fa-map-marker-alt"></span>
						<span>${_("Location")}: ${Address || _("no address")}</span>
					</div>
				</div>
			</div>
		`;
		};
		return infoTemplate;
	}
}
