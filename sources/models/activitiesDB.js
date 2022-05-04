const activities = new webix.DataCollection({
	url: "http://localhost:8096/api/v1/activities/",
	save: "rest->http://localhost:8096/api/v1/activities/",
	scheme: {
		$change: (obj) => {
			const parser = webix.Date.strToDate("%Y-%m-%d %H:%i");
			obj.DueDate = parser(obj.DueDate);
		},
		$save: (data) => {
			data.DueDate = webix.Date.dateToStr("%Y-%m-%d %H:%i")(data.DueDate);
		}
	}
});

export default activities;
