/*
 *@name     Rabbit
 *@version  
 *@desc     An Extremely Simple MVC Library used for SPA.
 *@author   VeeQun
 *@license  MIT
 *@modified 2014-06-25
 */
(function(context, undefined) {
  var emptyFunc = function(){};
  var ArrPush = Array.prototype.push;
  var HEAD = document.getElementsByTagName("head")[0], BASE = HEAD.getElementsByTagName("base")[0];
  // 模块状态码
  var READY = 0, LOADING = 1, LOADED = 2, COMPLETE = 3;

  var Cached = {};
  function require(mods, callback) {
    var module = new Module(callback);
    module.createDependcies(mods, this).load();
  }
  require.config = {
    "host": "/",
    "baseUrl": ""
  }
  function define(mods, callback) {
    if(!callback) {
      if(typeof mods == "function") {
        callback = mods;
        mods = [];
      }
    }
    if(typeof callback != "function") callback = emptyFunc;
    // 模块的处理函数、依赖模块以及作用域作为define的静态变量，以便complete时被模块获取
    define.handler = callback;
    define.dependModules = mods;
    define.scope = this;
  }
  // 模块
  function Module(mod) {
    var url = mod.toString();
    var modId = idGenerator(url);
    // 从缓存中获取
    if(Cached[modId]) return Cached[modId].module;
    // 若mod是一匿名函数callback，设定url为空，不做请求
    this.url = url.indexOf("function") == 0 ? "" : url;
    this.id = modId;
    this.status = READY;
    // 被哪些模块依赖
    this.dependeds = [];
    // 依赖哪些模块，dependMoudles只存储模块名，dependencies为依赖模块数
    this.dependModules = [];
    this.dependencies = 0;
    // 模块处理函数，若模块需要通过请求获得，则暂时置空，等待模块加载后，获取define中设定的callback
    this.handler = typeof mod == "function" ? mod : null;
    // 将模块放入缓存中，避免二次加载
    Cached[this.id] = {
      "module": this,
      "exports": null
    }
  }
  // 生成依赖模块，同时，启动依赖模块的加载
  Module.prototype.createDependcies = function(mods, scope) {
    mods = [].concat(mods);
    ArrPush.apply(this.dependModules, mods);
    this.scope = scope || null;
    var tempDependency = null;
    for(var k = 0, len = mods.length; k < len; ++k) {
      ++this.dependencies;
      tempDependency = new Module(mods[k]);
      tempDependency.depended([this]).load();
    }
    return this
  }
  Module.prototype.load = function() {
    if(this.status == COMPLETE) return this.notice();
    if(this.status == LOADED) return this.check();
    if(this.status == LOADING) return this.status;
    return this.url && loadScript(this), this.status = LOADING;
  }
  // 检查模块的依赖是否已经加载完成，若完成，执行模块
  Module.prototype.check = function() {
    if(this.dependencies == 0) return this.execute();
  }
  // 每个依赖模块执行后，减少模块数，以便check
  Module.prototype.step = function() {
    return --this.dependencies, this
  }
  // 模块执行，执行后通知依赖该模块的其他模块，并将状态置为COMPLETE
  Module.prototype.execute = function() {
    var dependExports = [], cache, dm = this.dependModules;
    // 获取依赖模块的接口
    for(var k = 0, len = dm.length; k < len; ++k) {
      (cache = Cached[idGenerator(dm[k])]) && dependExports.push(cache.exports)
    }
    this.handler && (Cached[this.id].exports = this.handler.apply(this.scope, dependExports));
    return this.notice(), this.status = COMPLETE
  }
  Module.prototype.notice = function() {
    for(var k = this.dependeds.length; k;) this.dependeds[--k].step().check();
  }
  // 添加被依赖
  Module.prototype.depended = function(mod) {
    return ArrPush.apply(this.dependeds, mod), this;
  }
  // id生成，匿名函数使用随机名
  function idGenerator(mod) {
    if(mod.indexOf("function") == 0) return "rabbit_anonymous_" + Math.random().toString(32).slice(2);
    return "rabbit_" + mod.replace(/\/|\\/g, "_");
  }
  // 简单的JS加载
  function loadScript(mod) {
    var url = require.config.host + require.config.baseUrl + "/" + mod.url + ".js";
    var maker = make(mod);
    maker.load(url);
  }
  function make(mod) {
    var tag = document.createElement("script");
    tag.type = "text\/javascript";
    tag.async = true;
    tag.defer = true;

    if("onload" in tag) {
        tag.onload = complete;
        tag.onerror = error;
    }else {
        tag.onreadystatechange = readyStateChange;
    }
    var maker = {
      "load": function(url) {
        tag.src = url;
        BASE?HEAD.inserBefore(tag, BASE):HEAD.appendChild(tag)
      }
    };
    return maker;
    function complete() {
      mod.handler = define.handler;
      var dm = define.dependModules;
      var scope = define.scope;
      mod.createDependcies(dm, scope);
      define.handler = null;
      define.dependModules = null;
      define.scope = null;
      mod.status = LOADED;
      mod.check();
      tag.parentNode.removeChild(tag)
    }
    function error() {
      throw new Error("Failed to load resource: " + mod.url)
    }
    function readyStateChange() {
      if(/complete|loaded/.test(this.readyState)) complete();
    }
  }
  context.require = require;
  context.define = define;
})(this);
(function(context) {
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
        "JSON": context.JSON || {
            "parse": function(jsonString) {
                var ret = null;
                eval("ret=("+jsonString+")");
                return ret
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
            var jsonStr = "{"+query.replace(/\&/g, ",").replace(/\=/g, ":").replace(/(\w+)/gim, "\"$1\"")+"}";
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
(function(Global, Base){
    var JSON = Base.Utils.JSON;
    var IS = Base.Utils.is;
    var Model = new Base.Class({
        "__constructor__": function() {
        },
        "__propertys__": function(config) {
        },
        "__init__": function() {
        }
    });
    Model.fn.extend({
        "get": function() {
        },
        "set": function(data) {
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
            require.config = {
                "host": this.config.VIEW_HOST,
                "baseUrl": this.config.VIEW_BASE
            };
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
            var viewUri = viewInfo.path;
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
(function(Global, Base){
    var JSON = Base.Utils.JSON;
    var IS = Base.Utils.is;
    var Store = new Base.Class({
        "__constructor__": function() {
            this.name;
        },
        "__propertys__": function(config) {
            config = config || {};
            this.name = config.name || Math.random().toString(16).slice(2).toUpperCase();
        },
        "__init__": function() {
            localStorage.setItem(this.name, "")
        }
    });
    Store.fn.extend({
        "get": function(name) {
            name = name || this.name;
            return JSON.parse(localStorage.getItem(this.name))
        },
        "set": function(name, data) {
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
    Base.Store = Store
})(this, Rabbit);