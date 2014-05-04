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
            "stringify": function(json) {
                return stringified(json);
                function stringified(source) {
                    var type = Object.prototype.toString.call(source).slice(8, -1);
                    switch(type) {
                    case "String":
                        return ("\"" + source.toString() + "\"");
                    case "Date":
                        return ("\"" + (source.toJSON?source.toJSON():dateJSON(source)) + "\"");
                    case "Array":
                        return arrStringify(source);
                    case "Object":
                        return objStringify(source);
                    case "Function":
                    case "Undefined":
                        return "null";
                    default:
                        return source.toString()
                    }
                }
                function objStringify(obj) {
                    var ret = [];
                    for(var k in obj) {
                        ret.push("\"" + k + "\":" + stringified(obj[k]))
                    }
                    return "{"+ret.join(",")+"}"
                }
                function arrStringify(arr) {
                    var ret = [];
                    for(var k = 0, len = arr.length; k < len; k++) {
                        ret.push(stringified(arr[k]))
                    }
                    return "[" +ret.join(",") + "]"
                }
                function dateJSON(date) {
                    return isFinite(date.valueOf())
                    ?   date.getUTCFullYear() + "-" +
                        zero(date.getUTCMonth() + 1) + '-' +
                        zero(date.getUTCDate())      + 'T' +
                        zero(date.getUTCHours())     + ':' +
                        zero(date.getUTCMinutes())   + ':' +
                        zero(date.getUTCSeconds())   + 'Z'
                    :   null;
                    function zero(n) {
                        return n < 10 ? '0' + n : n;
                    }
                }
            }
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
    Global.Rabbit = Base
})(this);