(function(Global) {
    var Base = {};
    Base.create = function(proto) {
        proto = proto || {};
        function F() {}
        F.prototype = proto;
        F.prototype.extend = _extend;
        return new F()
        function _extend(o) {
            for(var k in o) {
                this[k] = o[k]
            }
        }
    }
    Base.Class = function(parent, initializer) {
        if(!initializer) {
            initializer = parent || {};
            parent = function() {}
        }
        var supper = function() {}
        supper.prototype  = parent.prototype || {};
        var klass = function() {
            var self = this;
            this.supper = parent;
            typeof initializer.__constructor__ == "function" && initializer.__constructor__.apply(self, arguments);
            typeof initializer.__propertys__ == "function" && initializer.__propertys__.apply(self, arguments);
            typeof initializer.__init__ == "function" && initializer.__init__.apply(self, arguments);
        }
        klass.prototype = new supper;
        klass.extend = _extend;
        klass.prototype.extend = _extend;
        klass.fn = klass.prototype;
        klass.prototype.proxy = function(fn) {
            var self = this;
            return function() {
                fn.apply(self, arguments)
            }
        }
        return klass;

        function _extend(o) {
            for(var k in o) {
                this[k] = o[k]
            }
        }
    }

    Base.Utils = Base.create();
    Base.Utils.extend({
        "JSON": Global.JSON || {
            "parse": function(jsonString) {
                eval("return ("+jsonString+")")
            },
            "stringify": function(json) {}
        },
        "queryToJson": function(query) {
            var jsonStr = query.replace(/\&/g, ",").replace(/\=/g, ":");
            return jsonStr && this.JSON.parse(jsonStr)
        },
        "clear": function(str) {
            return str.replace(/[\t\r\n\s]/gm, "")
        },
        "is": (function() {
            var ToString = Object.prototype.toString;
            return function(source, type) {
                var srcType = ToString.call(source).slice(8, -1);
                return srcType.toLowerCase() == type.toLowerCase()
            }
        })()
    });
    Global.Base = Base
})(this);