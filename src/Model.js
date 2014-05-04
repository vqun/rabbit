(function(Global, Base){
    var JSON = Base.Utils.JSON;
    var IS = Base.Utils.is;
    var Model = new Base.Class({
        "__constructor__": function() {
            this.name;
        },
        "__propertys__": function(config) {
            this.name = config.name;
        },
        "__init__": function() {
            localStorage.setItem(this.name, "")
        }
    });
    Model.fn.extend({
        "get": function() {
            return JSON.parse(localStorage.getItem(this.name))
        },
        "set": function(data) {
            var store = this.get();
            if(IS(store, "array")){
                store = store.concat(data)
            }else {
                for(var k in data) {
                    store[k] = data[k]
                }
            }
            localStorage.setItem(this.name, JSON.stringify(store))
        }
    });
    Base.Model = Model
})(this, Rabbit);