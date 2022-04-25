import {JetView, plugins} from "webix-jet";

export default class TopView extends JetView {
	config() {
		const header = {
			type: "header",
			localId: "header",
			template: ({menuName}) => `${menuName || ""}`,
			css: "webix_header app_header"
		};

		const menu = {
			view: "menu",
			localId: "menu",
			id: "top:menu",
			css: "main-menu",
			width: 150,
			layout: "y",
			select: true,
			template: "<span class='webix_icon #icon#'></span> #value# ",
			data: [
				{value: "Contacts", id: "contacts", icon: "fa fa-users"},
				{value: "Activities", id: "activities", icon: "fa fa-calendar"},
				{value: "Settings", id: "settings", icon: "fa fa-cogs"}
			],
			on: {
				onAfterSelect: () => {
					const value = this.menu.getSelectedItem().value;
					this.header.setValues({menuName: value});
				}
			}
		};

		const ui = {
			type: "clean",
			paddingX: 5,
			rows: [
				header,
				{cols: [menu, {type: "wide",
					paddingY: 10,
					paddingX: 5,
					rows: [
						{$subview: true}
					]}]}
			]
		};

		return ui;
	}

	init() {
		this.use(plugins.Menu, "top:menu");
		this.header = this.$$("header");
		this.menu = this.$$("menu");
	}
}
