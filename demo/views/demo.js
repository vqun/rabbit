define(function() {
	var View = new Base.View({
		"onCreate": function() {
			console.log("demo:created")
		},
		"onLoad": function() {
			console.log("demo:loaded")
		},
		"onShow": function() {
			console.log("demo:shown")
		},
		"onHide": function() {
			console.log("demo:hidden")
		}
	});
	return View
})