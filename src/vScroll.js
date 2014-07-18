define(['cBase'], function (cBase) {
  function Event(el) {
    this.el = el;
    this.evtList = {};
    this.proxies = {};
  }
  Event.prototype.on = function(evtName, handler) {
    var elist;
    if(!(elist = this.evtList[evtName]) && !this.proxies[evtName]) {
      elist = this.evtList[evtName] = [];
      this.el.addEventListener(evtName, (this.proxies[evtName] = this.evtAccessor()), false)
    }
    return elist.push(handler), this;
  }
  Event.prototype.off = function(evtName, handler) {
    var elist = this.evtList[evtName];
    if(elist == undefined) return this;
    if(handler == undefined || typeof handler != "function") {
      elist.splice(0, elist.length);
      delete this.evtList[evtName];
      this.el.removeEventListener(evtName, this.proxies[evtName]);
      return delete this.proxies[evtName], this
    }
    for(var k = elist.length; k;) {
      if(elist[--k] == handler)
        elist.splice(k, 1);
    }
    if(!elist.length) {
      delete this.evtList[evtName];
      this.el.removeEventListener(evtName, this.proxies[evtName]);
      return delete this.proxies[evtName], this
    }
    return this
  }
  Event.prototype.evtAccessor = function() {
    var self = this;
    return function(evt) {
      var elist = self.evtList[evt.type];
      for(var k = 0, len = elist.length; k < len;)
        elist[k++](evt)
    }
  }
  Event.prototype.destroy = function() {
    for(var k in this.evtList) {
      this.off(k);
    }
  }
  function has(el, child) {
    var p = child;
    while(p) {
      if(p == el) return true;
      p = p.parentNode
    }
    return false;
  }
  function vScroll(el, config) {
    this.scroller = el;
    this.wrapper = config.wrapper || document.body;
    this.init();
    this.eventer = new Event(document.body)
  }
  vScroll.prototype.init = function() {
    this.pos = {
      "x": 0,
      "y": 0
    };
    this.isEnabled = false;
    this.scroller.style.transition = "transform 600ms cubic-bezier(0.1, 0.57, 0.1, 1)";
    this.scroller.style.webkitTransition = "transform 600ms cubic-bezier(0.1, 0.57, 0.1, 1)";
    var sh = parseInt(window.getComputedStyle(this.scroller, null)["height"])||this.scroller.offsetHeight,
        wh = parseInt(window.getComputedStyle(this.wrapper, null)["height"])||this.wrapper.offsetHeight;
    this.max = wh - sh;
    this.speed = 0.8;
    this.start = null;
    this.dir = 1;
  }
  vScroll.prototype.enable = function() {
    var self = this;
    this.eventer.on("touchstart", function(evt) {
      self.start = evt.touches[0];
    });
    this.eventer.on("touchmove", function(evt) {
      if(!self.isEnabled) return false;
      evt.preventDefault();
      if(!has(self.wrapper, self.start.target)) return false;
      var mv = evt.changedTouches[0];
      var deltaY = Math.floor((mv.pageY - self.start.pageY)), deltaX = mv.pageX - self.start.pageX;
      self.pos.y += deltaY;
      self.pos.x += deltaX;
      self.start = mv;
      var dir = deltaY/Math.abs(deltaY);
      if(dir != self.dir) self.speed = 0.8;
      if((self.pos.y > 0 && deltaY > 0) || (self.pos.y < self.max && deltaY < 0)) {
        self.pos.y -= deltaY;
        deltaY = deltaY*self.speed;
        deltaY>0? (deltaY > 1 ? null : (deltaY = 1)) : (deltaY > -2 ? (deltaY = -1) : null);
        self.pos.y += deltaY;
        self.speed *= .8
      }
      self.scroller.style.transform = "translateY("+self.pos.y+"px) translateZ(0px)";
    });
    this.eventer.on("touchend", function(evt) {
      if(!self.isEnabled) return false;
      evt.preventDefault();
      if(self.pos.y > 0) {
        self.scroller.style.transform = "translateY(0px) translateZ(0px)";
        self.speed = 0.8;
        self.pos.y = 0;
      }
      if(self.pos.y < self.max) {
        self.scroller.style.transform = "translateY(" + self.max + "px) translateZ(0px)";
        self.speed = 0.8;
        self.pos.y = self.max;
      }
    });
    this.isEnabled = true;
    return this;
  }
  vScroll.prototype.disable = function() {
    this.isEnabled = false;
    this.eventer.destroy();
  }
  return vScroll
});