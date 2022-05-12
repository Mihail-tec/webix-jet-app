import {JetView} from "webix-jet";


export default class SettingsDatatable extends JetView {
	constructor(app, name, data) {
		super(app, name);
		this.data = data;
	}

	config() {
		const _ = this.app.getService("locale")._;

		const table = {
			view: "datatable",
			localId: "datatable",
			select: "row",
			columns: [
				{
					id: "Value",
					header: _("Value"),
					width: 200,
					sort: "text",
					fillspace: true
				},
				{
					id: "Icon",
					header: _("Icon"),
					width: 200,
					sort: "text",
					fillspace: true
				},
				{
					header: "",
					width: 50,
					template: "<span class='far fa-trash-alt delete'></span>"
				}
			],
			on: {
				onAfterSelect: (id) => {
					this.form.setValues(this.datatable.getItem(id));
					this.addClick.setValue(_("Save"));
					this.form.clearValidation();
				}
			},
			onClick: {
				delete: (e, id) => {
					webix.confirm(_("Are you sure you want to delete?")).then(() => {
						this.data.remove(id);
						this.clearField();
					});
				}
			}


		};

		const form = {
			view: "form",
			localId: "form",
			elements: [
				{
					view: "text",
					name: "Value",
					label: _("Value"),
					placeholder: _("Value"),
					invalidMessage: _("Field required")
				},
				{
					view: "text",
					name: "Icon",
					label: _("Icon"),
					placeholder: _("Icon"),
					invalidMessage: _("Field required")
				},
				{
					cols: [
						{
							view: "button",
							localId: "addClick",
							value: _("Add"),
							css: "webix_primary",
							click: () => this.save()
						},
						{
							view: "button",
							value: _("Cancel"),
							click: () => this.clearField()
						}
					]
				}
			],
			rules: {
				Value: webix.rules.isNotEmpty,
				Icon: webix.rules.isNotEmpty
			}
		};
		return {
			rows: [
				table,
				form
			]
		};
	}

	init() {
		this.datatable = this.$$("datatable");
		this.form = this.$$("form");
		this.addClick = this.$$("addClick");
		this.datatable.sync(this.data);
	}

	save() {
		const formValues = this.form.getValues();
		if (!this.form.validate()) {
			return;
		}

		if (formValues.id) {
			this.data.updateItem(formValues.id, formValues);
		}
		else {
			this.data.add(formValues);
		}

		this.clearField();
	}

	clearField() {
		const _ = this.app.getService("locale")._;
		this.form.clear();
		this.form.clearValidation();
		this.datatable.unselectAll();
		this.addClick.setValue(_("Add"));
	}
}
