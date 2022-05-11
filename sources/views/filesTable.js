import {JetView} from "webix-jet";

import files from "../models/filesDB";

export default class FilesTable extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const filesTable = {
			view: "datatable",
			localId: "filesTable",
			columns: [
				{
					id: "name",
					header: _("Name"),
					sort: "text",
					fillspace: true
				},
				{
					id: "changeDate",
					header: _("Change date"),
					sort: "date",
					width: 200,
					format: webix.Date.dateToStr("%d %M %Y %H:%i")
				},
				{
					id: "size",
					header: _("Size"),
					sort: "int",
					template: "#sizetext#"
				},
				{
					header: "",
					width: 50,
					template: "<span class='far fa-trash-alt delete'></span>"
				}
			],
			onClick: {
				delete: (e, id) => {
					webix.confirm(_("Are you sure you want to delete?")).then(() => {
						files.remove(id);
						this.filesTable.filter("#ContactID#", this.id);
					});
				}
			}
		};

		const uploadFile = {
			view: "uploader",
			localId: "uploder",
			value: _("Upload file"),
			upload: "files",
			autosend: false,
			width: 500,
			align: "center",
			on: {
				onBeforeFileAdd: (file) => {
					file.changeDate = new Date();
				},
				onAfterFileAdd: (file) => {
					file.ContactID = this.id;
					files.add({...file});
					this.filesTable.filter("#ContactID#", file.ContactID);
				},
				onFileUploadError: (file) => {
					webix.message({type: "error", text: `${_("Error during file upload")} ${file}`});
				}
			}
		};

		return {
			rows: [
				filesTable,
				{
					cols: [
						{},
						uploadFile,
						{}
					]
				}

			]
		};
	}

	init() {
		this.filesTable = this.$$("filesTable");
		this.filesTable.sync(files);
	}

	urlChange() {
		this.id = this.getParam("contactsId", true);
		if (this.id) {
			this.filesTable.filter("#ContactID#", this.id);
		}
	}
}
