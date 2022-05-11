import {JetView} from "webix-jet";

import activitiesTypes from "../../models/activityTypesDB";
import statuses from "../../models/statusesDB";
import SettingsDatatable from "./settingsDatatable";

export default class Settings extends JetView {
	config() {
		const locale = this.app.getService("locale");
		const _ = locale._;
		const lang = locale.getLang();

		const segmentedBtn = {
			view: "segmented",
			localId: "segmentedBtn",
			label: _("Language"),
			value: lang,
			options: [
				{id: "en", value: _("English")},
				{id: "ru", value: _("Russian")}
			],
			click: () => this.toggleLanguage()

		};

		return {
			rows: [
				segmentedBtn,
				{
					cols: [
						{
							rows: [
								{
									view: "template",
									template: _("Activities types"),
									type: "header"
								},
								new SettingsDatatable(this.app, "", activitiesTypes)
							]
						},
						{
							rows: [
								{
									view: "template",
									template: _("Statuses "),
									type: "header"
								},
								new SettingsDatatable(this.app, "", statuses)
							]
						}
					]
				}
			]
		};
	}

	init() {
		this.lang = this.$$("segmentedBtn");
	}

	toggleLanguage() {
		const langs = this.app.getService("locale");
		const value = this.lang.getValue();
		langs.setLang(value);
	}
}
