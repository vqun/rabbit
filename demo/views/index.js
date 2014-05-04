define(function() {
	var View = new Rabbit.View({
		"onCreate": function() {
			console.log("index:created")
		},
		"onLoad": function() {
			console.log("index:loaded")
		},
		"onShow": function() {
			console.log("index:shown")
		},
		"onHide": function() {
			console.log("index:hidden")
		}
	});
	return View
})