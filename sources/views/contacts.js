import {JetView} from "webix-jet";

import contacts from "../models/contactsDB";
import statuses from "../models/statusesDB";

export default class Contacts extends JetView {
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
			}
		};

		const deleteButton = {
			view: "button",
			label: "Delete",
			width: 100,
			type: "icon",
			icon: "far fa-trash-alt"
		};

		const editButton = {
			view: "button",
			label: "Edit",
			width: 100,
			type: "icon",
			icon: "far fa-edit"
		};

		const infoHeader = {
			cols: [
				{
					localId: "infoTitle",
					autoheight: true,
					padding: 10,
					template: ({FirstName, LastName}) => `${FirstName} ${LastName}`
				},
				{},
				deleteButton,
				editButton
			]
		};

		const infoMain = {
			localId: "infoMain",
			template: this.infoTemplate()
		};

		return {
			cols: [
				list,
				{
					type: "clean",
					margin: 10,
					padding: 20,
					rows: [
						infoHeader,
						infoMain

					]
				}
			]
		};
	}

	init() {
		this.list = this.$$("list");
		this.infoTitle = this.$$("infoTitle");
		this.infoMain = this.$$("infoMain");
		contacts.waitData.then(() => {
			this.list.parse(contacts);
			const select = this.getParam("id") || this.list.getFirstId();
			this.setParam("id", select, true);
			this.list.select(select);
		});
	}

	ready() {
		this.on(this.list, "onAfterSelect", (id) => {
			this.show(`/top/contacts?id=${id}`);
			const contact = contacts.getItem(id);
			this.infoTitle.parse(contact);
			const statuseId = contact.StatusID;
			statuses.waitData.then(() => {
				const statuse = statuses.getItem(statuseId);
				const {Value: status, Icon: icon} = statuse || {Value: "", icon: ""};
				this.infoMain.setValues({...contact, Status: status, StatusIcon: icon}, true);
			});
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
			Status = "",
			StatusIcon = ""
		}) => {
			const photo = Photo || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Breezeicons-actions-22-im-user.svg/1200px-Breezeicons-actions-22-im-user.svg.png";

			return `
			<div class="info">
				<div class="info_block">
					<div class="info_photo">
						<img src=${photo} alt="photo">
					</div>

					<div class="info_status">
						<span class="status-name">${Status}</span>
						<span class='fas fa-${StatusIcon}'></span>
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
						<span>Date of birth: ${Birthday || "no birthday"}</span>
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
