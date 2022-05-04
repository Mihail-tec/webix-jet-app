import {JetView} from "webix-jet";

import contacts from "../../models/contactsDB";
import statuses from "../../models/statusesDB";

export default class ContactForm extends JetView {
	config() {
		const contactHeader = {
			template: "Header",
			localId: "contactHeader",
			type: "header"
		};
		const contactForm = {
			view: "form",
			localId: "contactForm",
			elements: [
				{
					margin: 20,
					cols: [
						{
							margin: 20,
							rows: [
								{
									view: "text",
									label: "First name",
									name: "FirstName",
									invalidMessage: "Field required",
									labelWidth: "auto",
									bottomLabel: "*name must start with a capital letter"
								},
								{
									view: "text",
									label: "Last name",
									name: "LastName",
									invalidMessage: "Field required",
									labelWidth: "auto",
									bottomLabel: "*name must start with a capital letter"
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
									name: "Job",
									labelWidth: "auto"
								},
								{
									view: "text",
									label: "Company",
									name: "Company",
									labelWidth: "auto"
								},
								{
									view: "text",
									label: "Website",
									name: "Website",
									labelWidth: "auto"
								},
								{
									view: "textarea",
									label: "Address",
									name: "Address",
									height: 60,
									labelWidth: "auto"
								}
							]
						},
						{
							margin: 20,
							rows: [
								{
									view: "text",
									label: "Email",
									name: "Email",
									invalidMessage: "Invalid email format",
									labelWidth: "auto"
								},
								{
									view: "text",
									label: "Skype",
									name: "Skype",
									labelWidth: "auto"
								},
								{
									view: "text",
									label: "Phone",
									name: "Phone",
									labelWidth: "auto",
									bottomLabel: "*phone number must be 12 digits and start with '+'",
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
										{},
										{
											rows: [
												{},
												{
													view: "uploader",
													value: "Change photo",
													autosend: false,
													multiple: false,
													accept: "image/jpeg, image/png",
													on: {
														onAfterFileAdd: (upload) => {
															this.uploadFile(upload);
														}
													}
												},
												{
													view: "button",
													value: "Delete photo",
													click: () => {
														this.webix.confirm("Are you sure?")
															.then(() => {
																this.image.setValues({src: ""});
															});
													}
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{},
				{
					margin: 20,
					borderless: true,
					cols: [
						{},
						{
							view: "button",
							value: "value",
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
								this.app.callEvent("select", [this.id]);
							}
						}
					]
				}
			],
			rules: {
				FirstName: (value) => {
					const valid = /^[A-ЯЁ][а-яё]{2,20}|[A-Z][a-z]{2,20}$/.test(value);
					if (valid) {
						return true;
					}
					return false;
				},
				LastName: (value) => {
					const valid = /^[A-ЯЁ][а-яё]{2,40}|[A-Z][a-z]{2,40}$/.test(value);
					if (valid) {
						return true;
					}
					return false;
				},
				Email: (value) => {
					const valid = /^[A-Za-zА-яа-я0-9._%+-]+@[a-z0-9.]+.[a-z]{2,4}$/.test(value);
					if (valid) {
						return true;
					}
					return false;
				},
				Phone: (value) => {
					const valid = /^\+\d{12,}$/.test(value);
					if (valid) {
						return true;
					}
					return false;
				}
			}
		};

		return {
			rows: [contactHeader, contactForm]
		};
	}

	init() {
		this.id = this.getParam("id", true);
		this.form = this.$$("contactForm");
		this.image = this.$$("image");
		this.contactHeader = this.$$("contactHeader");
		this.actionBtn = this.$$("actionBtn");
	}

	urlChange() {
		if (this.id) {
			contacts.waitData.then(() => {
				const contact = contacts.getItem(this.id);
				if (contact) {
					this.form.setValues(contact);
					this.image.setValues({src: contact.Photo});
				}
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
			this.image.setValues({src: ""});
		}
	}

	save() {
		const formValues = this.form.getValues();
		if (this.form.validate()) {
			const dateFormat = webix.Date.dateToStr("%Y-%m-%d %H:%i");
			formValues.Photo = this.image.getValues().src;
			formValues.Birthday = dateFormat(formValues.Birthday);
			formValues.StartDate = dateFormat(formValues.StartDate);
			if (contacts.exists(formValues.id)) {
				contacts.updateItem(formValues.id, formValues);
			}
			else {
				contacts.waitSave(() => {
					contacts.add(formValues);
				}).then((obj) => {
					this.app.callEvent("select", [obj.id]);
				});
			}
			this.form.clear();
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
