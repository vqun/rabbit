(function(Global, Base){
    var IS = Base.Utils.is;
    var View = new Base.Class({
        "__constructor__": function() {
            this.isCreated;
        },
        "__propertys__": function() {
            this.isCreated = false;
        },
        "__init__": function(options) {
            if(!IS(options, "object")) {
                return false
            }
            for(var k in options) {
                this[k] = options[k]
            }
        }
    });
    View.fn.extend({
        "onCreate": function() {},
        "onLoad": function() {},
        "onShow": function() {},
        "onHide": function() {},
        "start": function() {}
    });
    Base.View = View
})(this, Base);