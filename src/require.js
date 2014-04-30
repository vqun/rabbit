(function(Global) {
    var CachedJs = {};
    var HEAD = document.getElementsByTagName("head")[0];
    function require(uri, callback) {
        var modId = makeModuleId(uri);

        var cached = CachedJs[uri];
        if(cached) {
            if(cached.loaded)
                return callback(cached.exports)
            if(cached.loading)
                return cached.module.addCallBack(callback)
        }
        CachedJs[modId] = {};
        var $mod = CachedJs[modId];
        $mod.uri = uri;
        return ($mod.module = new Module(fullURI(uri), modId, callback)).load();
    }
    require.config = {
        "HOST": "\/",
        "BASE": ""
    }
    function define(mod) {
        if(typeof mod == "function")
            define.exports = mod();
        else
            define.exports = mod;
    }
    function Module(uri, id, callback){
        Maker.apply(this, arguments);
    }
    Module.prototype.load = function() {
        HEAD.appendChild(this.tag)
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
            var modExports = define.exports || {};
            delete define.exports;
            var cbList = mod.callbackList;
            for(var k = cbList.length; k; ) {
                cbList[--k](modExports)
            }
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