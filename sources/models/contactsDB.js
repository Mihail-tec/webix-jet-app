const contacts = new webix.DataCollection({
	url: "http://localhost:8096/api/v1/contacts/",
	save: "rest->http://localhost:8096/api/v1/contacts/",
	scheme: {
		$init: (item) => {
			item.value = `${item.FirstName} ${item.LastName}`;
		}
	}
});

export default contacts;
