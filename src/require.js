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
})(this)