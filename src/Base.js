(function(context) {
  var Base = {};
  Base.create = function(proto) {
    proto = proto || {};

    function F() {}
    F.prototype = proto;
    F.prototype.extend = _extend;
    return new F()

    function _extend(o) {
      for (var k in o) {
        this[k] = o[k]
      }
    }
  }
  Base.Class = function(parent, initializer) {
    if (!initializer) {
      initializer = parent || {};
      parent = function() {}
    }
    var supper = function() {}
    supper.prototype = typeof parent == "function" ? parent.prototype : parent;
    supper.prototype.constructor = supper;
    var klass = function() {
      var self = this;
      this.supper = parent;
      typeof initializer.__constructor__ == "function" && initializer.__constructor__.apply(self, arguments);
      typeof initializer.__propertys__ == "function" && initializer.__propertys__.apply(self, arguments);
      typeof initializer.__init__ == "function" && initializer.__init__.apply(self, arguments);
    }
    klass.prototype = new supper;
    klass.prototype.constructor = klass;
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
      for (var k in o) {
        this[k] = o[k]
      }
    }
  }
  Base.Utils = Base.create();
  Base.Utils.extend({
    "JSON": context.JSON || {
      "parse": function(jsonString) {
        var ret = null;
        eval("ret=(" + jsonString + ")");
        return ret
      },
      "stringify": function(json) {
        return stringified(json);

        function stringified(source) {
          var type = Object.prototype.toString.call(source).slice(8, -1);
          switch (type) {
            case "String":
              return "\"" + source.toString() + "\"";
            case "Date":
              return "\"" + (source.toJSON ? source.toJSON() : dateJSON(source)) + "\"";
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
          for (var k in obj) {
            ret.push("\"" + k + "\":" + stringified(obj[k]))
          }
          return "{" + ret.join(",") + "}"
        }

        function arrStringify(arr) {
          var ret = [];
          for (var k = 0, len = arr.length; k < len; k++) {
            ret.push(stringified(arr[k]))
          }
          return "[" + ret.join(",") + "]"
        }

        function dateJSON(date) {
          return isFinite(date.valueOf()) ? date.getUTCFullYear() + "-" +
            zero(date.getUTCMonth() + 1) + '-' +
            zero(date.getUTCDate()) + 'T' +
            zero(date.getUTCHours()) + ':' +
            zero(date.getUTCMinutes()) + ':' +
            zero(date.getUTCSeconds()) + 'Z' : null;

          function zero(n) {
            return n < 10 ? '0' + n : n;
          }
        }
      }
    },
    "XObject": {
      "get": function(name, source) {
        if (!name || !source || typeof name != "string" || typeof source != "object") return null;
        var attrs = name.replace(/^\.|\.$/, "").split("."),
          step = source;
        while ((step = step[attrs.shift()]) && attrs.length);
        return step || null
      },
      "set": function(name, source, data) {
        if (!name || !source || typeof name != "string" || typeof source != "object") return true;
        var attrs = name.replace(/^\.|\.$/, "").split("."),
          step = source,
          index;
        while (index = attrs.shift(), step[index] ? null : step = step[index] = {}, attrs.length > 1);
        step[attrs.shift() || index] = data;
        return step = null, true
      },
      "remove": function(name, source) {
        if (!name || !source || typeof name != "string" || typeof source != "object") return null;
        var attrs = name.replace(/^\.|\.$/, "").split("."),
          step = source;
        while (attrs.length > 1 && (step = step[attrs.shift()]));
        return delete step[attrs.shift()]
      }
    },
    "XDate": {
      "time": /(?:(\d{4})([\-\.\/]))?(?:(\d{1,2})(?:\2|[\-\.\/])(\d{1,2})\s+)?(?:(\d{1,2})(\:)(\d{1,2})(?:\6(\d{1,2}))?)?/m,
      "dPattern": "y-m-d h:i:s",
      "methods": {
        "y": ["setFullYear", "getFullYear"],
        "m": ["setMonth", "getMonth"],
        "d": ["setDate", "getDate"],
        "h": ["setHours", "getHours"],
        "i": ["setMinutes", "getMinutes"],
        "s": ["setSeconds", "getSeconds"]
      },
      "resolve": function(timestr) {
        if (timestr instanceof Date) return timestr;
        var d = new Date(),
          timeinfo = null,
          t = null,
          f = null;
        if (typeof timestr == "string") {
          timeinfo = this.time.exec(timestr);
          t = ~~timeinfo[3], d.setMonth(t > 12 ? (f = Math.floor(t / 12), t % 12 - 1) : (f = 0, t - 1));
          t = ~~timeinfo[1] + f, d.setFullYear((f = 0, t));

          t = ~~timeinfo[8], d.setSeconds(t > 60 ? (f = Math.floor(t / 60), t % 60) : (f = 0, t));
          t = ~~timeinfo[7] + f, d.setMinutes(t > 60 ? (f = Math.floor(t / 60), t % 60) : (f = 0, t));
          t = ~~timeinfo[5] + f, d.setHours(t > 24 ? (f = Math.floor(t / 24), t % 24) : (f = 0, t));

          t = ~~timeinfo[4] + f, d.setDate(t);
        }
        return d;
      },
      "format": function(time, pattern) {
        if (!(time instanceof Date)) {
          pattern = time;
          time = new Date();
        }
        typeof pattern != "string" && (pattern = this.dPattern);
        var pts = pattern.split(/\b/),
          pt, ret = [],
          m, t;
        while (pt = pts.shift()) {
          m = this.methods[pt.toLowerCase().slice(0, 1)];
          if (m) {
            t = time[m[1]]();
            if (++t < 10) t = "0" + t;
            ret.push(t);
          } else ret.push(pt);
        }
        return ret.join("")
      },
      "translate": function(timestr, ref) {
        typeof timestr != "string" && (timestr = "1D");
        if (!(ref instanceof Date)) ref = new Date();
        var time = new Date(ref.getTime());
        var ts = timestr.toLowerCase().split(""),
          t, f = "";
        while (t = ts.shift()) {
          m = this.methods[t.slice(0, 1)];
          if (m) {
            time[m[0]](time[m[1]]() + ~~f);
            f = "";
          } else f += t;
        }
        return time
      }
    },
    "queryToJson": function(query) {
      var jsonStr = "{" + query.replace(/\&/g, ",").replace(/\=/g, ":").replace(/(\w+)/gim, "\"$1\"") + "}";
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
  context.Rabbit = Base
})(this);