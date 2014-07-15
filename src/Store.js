(function(context, Base, undefined){
    var utils = Base.Utils, json = utils.JSON, is = utils.is, XObject = utils.XObject, XDate = utils.XDate, ls = localStorage;
    var Store = new Base.Class({
        "__constructor__": function() {
            this.name;
        },
        "__propertys__": function(config) {
            config = config || {};
            this.name = config.name || Math.random().toString(16).slice(2).toUpperCase();
        },
        "__init__": function(config) {
            var ep = XDate.translate(config.lifetime);
            var old = ls.getItem(this.name) || null;
            !old && ls.setItem(this.name, json.stringify({expired: ep.getTime()}))
        }
    });
    Store.fn.extend({
        "get": function(name) {
            var t = json.parse(ls.getItem(this.name));
            if(!name || !is(name, "string")) return t;
            var ep = new Date(t.expired), now = new Date();
            if(ep > now) return this.set("expiredValue", t.value).set(null), null;
            var ret = null;
            ret = XObject.get("value."+name, t);
            return ret
        },
        "set": function(name, data) {
            if(data == undefined) data = name, name = undefined;
            var store = this.get();
            if(name == undefined || is(store, "array")) store.value = data||"";
            else XObject.set("value."+name.replace(/^\.|\.$/g, ""), store, data);
            return ls.setItem(this.name, json.stringify(store)), this
        },
        "remove": function(name) {
            if(!name || !is(name, "string")) return false;
            var store = this.get();
            return XObject.remove("value."+name, store)
        }
    });
    Base.Store = Store
})(this, Rabbit);