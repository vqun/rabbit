/*
 *@name Rabbit
 *@version v0.1.0
 *@desc An Extremely Simple MVC Library used for SPA.
 *@author VeeQun
 *@license MIT
 *@date 2014-05-04
 */
(function(Global) {
    var CachedJs = {};
    var HEAD = document.getElementsByTagName("head")[0];
    var BASE = HEAD.getElementsByTagName("base")[0];
    function require(uri, callback) {
        var modId = makeModuleId(uri);

        var cached = CachedJs[modId];
        if(cached) {
            if(cached.loaded)
                return callback(cached.exports)
            if(cached.loading)
                return cached.module.addCallBack(callback)
        }
        var $mod = CachedJs[modId] = {};
        $mod.uri = uri;
        return ($mod.module = new Module(fullURI(uri), modId, callback)).load();
    }
    require.config = {
        "HOST": "\/",
        "BASE": ""
    }
    function define(handler) {
        if(typeof handler == "function")
            define.exports = handler();
        else
            define.exports = handler;
    }
    function Module(uri, id, callback){
        Maker.apply(this, arguments);
    }
    Module.prototype.load = function() {
        BASE?HEAD.inserBefore(this.tag, BASE):HEAD.appendChild(this.tag)
    }
    Module.prototype.destroy = function() {
        HEAD.removeChild(this.tag)
    }
    Module.prototype.addCallBack = function(cb) {
        this.callbackList.push(cb)
    }

    function Maker(uri, id, callback) {
        this.uri = uri;
        this.id = id;
        this.type = Maker.checkoutType(uri);
        (this.callbackList = []).push(callback);

        this.tag = Maker.createTag(this.type, uri);
        Maker.bindEvents.call(this, this.tag);
    }
    Maker.checkoutType = function(uri) {
        var i = uri.lastIndexOf("\.");
        return uri.slice(++i)
    }
    Maker.createTag = function(type, uri) {
        var tag = null;
        if(type == "js") {
            tag = document.createElement("script");
            tag.type = "text\/javascript";
            tag.async = true;
            tag.defer = true;
            tag.src = uri;
        }else {
            tag = document.createElement("link");
            tag.rel = "stylesheet";
            tag.type = "text\/css";
            tag.href = uri;
        }
        return tag
    }
    Maker.bindEvents = function(el) {
        var mod = this;
        if("onload" in el) {
            el.onload = complete;
            el.onerror = error;
        }else {
            el.onreadystatechange = readyStateChange;
        }
        return true;

        function complete() {
            var modExports = define.exports;
            if(!modExports) return false;
            delete define.exports;
            mod.destroy();
            var cbList = mod.callbackList;
            for(var k = cbList.length; k; ) {
                cbList[--k](modExports)
            }
            CachedJs[mod.id].exports = modExports;
            modExports = null;
        }
        function error() {
            throw "Error: file load failed"
        }
        function readyStateChange() {
            if(/complete|loaded/.test(this.readyState)) {
                complete()
            }
        }
    }
    function fullURI(uri) {
        if(uri.indexOf("http") == -1) {
            if(!/\.(css|js)$/.test(uri)) {
                uri = uri + "\.js"
            }
            uri = (uri.indexOf("/")==0 ? "" : require.config.HOST) + require.config.BASE + uri
        }
        return uri
    }
    function makeModuleId(uri) {
        return "rabbit_" + uri.replace(/\//g, "_")
    }
    Global.require = require;
    Global.define = define;
})(this);
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
})(this, Rabbit);
(function(Global, Base) {
    var Controller = new Base.Class({
        "__constructor__": function(config) {
            this.router = {};
            this.currentView = "";
            this.config = {
                "VIEW_HOST": config.VIEW_HOST || "/",
                "VIEW_BASE": config.VIEW_BASE || "",
                "VIEW_DEFAULT": "index",
                "MAIN_CONTAINER": config.MAIN_CONTAINER || document.body
            };
        },
        "__init__": function() {
            this.hashChange();
            Global.onhashchange = this.proxy(this.hashChange);
        }
    });
    Controller.fn.extend({
        "hashChange": function() {
            var viewinfo = this.getViewInfo();
            this.switchView(viewinfo);
        },
        "switchView": function(viewInfo){
            var view = null;
            var viewUri = this.getViewUri(viewInfo.path);
            var viewRouter = this.router[viewUri] || (this.router[viewUri] = {});
            if(!(view = viewRouter.view)) {
                require(viewUri, this.proxy(loadView));
            }else {
                view.param = Base.Utils.queryToJson(viewInfo.query);
                this.viewLoaded(view)
            }
            return true

            function loadView(view) {
                viewRouter.view = view;
                view.param = Base.Utils.queryToJson(viewInfo.query);

                this.create(view, viewUri);
                this.render(view);
                this.viewLoaded(view)
            }
        },
        "create": function(view, viewRouter) {
            var conInfo = this.createContainer();
            viewRouter.container = conInfo.container;
            viewRouter.id = conInfo.id;
            view.el = conInfo.container;
            view.viewID = conInfo.id;
            view.onCreate();
        },
        "render": function(view) {
            this.config.MAIN_CONTAINER.appendChild(view.el);
        },
        "viewLoaded": function(view) {
            view.onLoad();
            this.swapView(view);
            view.start()
        },
        "swapView": function(view) {
            var cView;
            (cView = this.currentView) &&
            !!(cView.el.style.display = "none") &&
            cView.onHide();

            this.currentView = view;
            view.el.style.display = "";
            view.onShow();
        },
        "getViewInfo": function() {
            var hash = location.hash.split("?");
            return {
                "path": (hash[0]|| "#"+this.config.VIEW_DEFAULT).replace("#", "\/"),
                "query": hash[1]||""
            }
        },
        "getViewUri": function(viewpath) {
            return this.config.VIEW_HOST + this.config.VIEW_BASE + viewpath
        },
        "createContainer": (function() {
            var id = 0, prefix = "rabbit-view-";
            return function() {
                var viewContainer = document.createElement("div");
                var viewConId = prefix + ++id;
                viewContainer.id = viewConId;
                viewContainer.style.display = "none";
                return {
                    container: viewContainer,
                    id: viewConId
                }
            }
        })()
    });
    Base.Controller = Controller
})(this, Rabbit);