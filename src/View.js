(function(Global, Base){
  var is = Base.Utils.is;
  var View = new Base.Class({
    "__constructor__": function() {
      this.isCreated;
    },
    "__propertys__": function() {
      this.isCreated = false;
    },
    "__init__": function(options) {
      if(!is(options, "object")) {
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
    "start": function(action) {
      try{
        this[action.name].apply(this, action.args)
      }catch(e) {}
    }
  });
  Base.View = View
})(this, Rabbit);