import {JetView} from "webix-jet";

import contacts from "../../models/contactsDB";
import statuses from "../../models/statusesDB";

export default class ContactForm extends JetView {
	config() {
		const contactHeader = {
			template: "Add new contact",
			localId: "contactHeader",
			type: "header"
		};
		const contactForm = {
			view: "form",
			localId: "contactForm",
			scroll: true,
			elementsConfig: {
				labelWidth: 120
			},
			elements: [
				{
					margin: 20,
					cols: [
						{
							minWidth: 200,
							margin: 20,
							rows: [
								{
									view: "text",
									label: "First name",
									name: "FirstName",
									invalidMessage: "Field required"
								},
								{
									view: "text",
									label: "Last name",
									name: "LastName",
									invalidMessage: "Field required"
								},
								{
									view: "datepicker",
									label: "Joing date",
									name: "StartDate",
									format: "%d %m %Y"
								},
								{
									view: "richselect",
									label: "Status",
									name: "StatusID",
									options: statuses
								},
								{
									view: "text",
									label: "Job",
									name: "Job"
								},
								{
									view: "text",
									label: "Company",
									name: "Company"
								},
								{
									view: "text",
									label: "Website",
									name: "Website"
								},
								{
									view: "textarea",
									label: "Address",
									name: "Address",
									height: 60
								}
							]
						},
						{
							minWidth: 200,
							margin: 20,
							rows: [
								{
									view: "text",
									label: "Email",
									name: "Email",
									invalidMessage: "Invalid email format"
								},
								{
									view: "text",
									label: "Skype",
									name: "Skype"
								},
								{
									view: "text",
									label: "Phone",
									name: "Phone",
									invalidMessage: "Please enter a valid phone number(BY)"
								},
								{
									view: "datepicker",
									label: "Birthday",
									name: "Birthday",
									format: "%d %m %Y"
								},
								{
									margin: 20,
									cols: [
										{
											template({src}) {
												return `<img src="${src || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Breezeicons-actions-22-im-user.svg/1200px-Breezeicons-actions-22-im-user.svg.png"}" class="img"/>`;
											},
											localId: "image",
											name: "Photo",
											width: 200
										},
										{}
									]
								}
							]
						}
					]
				},
				{
					cols: [
						{},
						{
							view: "uploader",
							value: "Change photo",
							autosend: false,
							multiple: false,
							accept: "image/jpeg, image/png",
							width: 200,
							on: {
								onAfterFileAdd: (upload) => {
									this.uploadFile(upload);
								}
							}
						},
						{
							view: "button",
							value: "Delete photo",
							width: 200,
							click: () => {
								this.webix.confirm("Are you sure you want to delete?")
									.then(() => {
										this.image.setValues({src: ""});
									});
							}
						}
					]
				}
			],
			rules: {
				FirstName: webix.rules.isNotEmpty,
				LastName: webix.rules.isNotEmpty,
				Email: webix.rules.isEmail,
				Phone: webix.rules.isNumber
			}
		};

		const btns = {
			margin: 20,
			borderless: true,
			cols: [
				{},
				{
					view: "button",
					value: "Add",
					localId: "actionBtn",
					width: 200,
					css: "webix_primary",
					click: () => this.save()
				},
				{
					view: "button",
					value: "Cancel",
					width: 200,
					click: () => {
						if (this.form.isDirty()) {
							webix.confirm("All unsaved data will be lost, are you sure?")
								.then(() => {
									this.app.callEvent("select", [this.contactsId]);
								});
						}
						else {
							this.app.callEvent("select", [this.contactsId]);
						}
					}
				}
			]
		};

		return {
			rows: [contactHeader, contactForm, btns]
		};
	}

	init() {
		this.form = this.$$("contactForm");
		this.image = this.$$("image");
		this.contactHeader = this.$$("contactHeader");
		this.actionBtn = this.$$("actionBtn");
	}

	urlChange() {
		this.contactsId = this.getParam("contactsId", true);
		if (this.contactsId) {
			contacts.waitData.then(() => {
				const contact = contacts.getItem(this.contactsId);
				this.form.setValues(contact);
				this.image.setValues({src: contact.Photo});
				this.contactHeader.setHTML("Edit contact");
				this.actionBtn.setValue("Save");
			});
		}
		else {
			this.form.clear();
			this.contactHeader.setHTML("Add new contact");
			this.actionBtn.setValue("Add");
		}
	}

	save() {
		const formValues = this.form.getValues();
		if (this.form.validate()) {
			const dateFormat = webix.Date.dateToStr("%Y-%m-%d %H:%i");
			formValues.Photo = this.image.getValues().src;
			formValues.Birthday = dateFormat(formValues.Birthday);
			formValues.StartDate = dateFormat(formValues.StartDate);

			if (this.contactsId) {
				contacts.updateItem(formValues.id, formValues);
				this.app.callEvent("select", [this.contactsId]);
			}
			else {
				contacts.waitSave(() => {
					contacts.add(formValues);
				}).then((obj) => {
					this.app.callEvent("select", [obj.id]);
				});
			}
		}
	}

	uploadFile(upload) {
		const file = upload.file;
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (event) => {
			this.image.setValues({src: event.target.result});
		};
		reader.onerror = (error) => {
			this.webix.message({type: "error", text: error});
		};

		return false;
	}
}
