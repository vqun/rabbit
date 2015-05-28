/*
 *@author wqceng@
 *@desc 用于城市列表的右侧字母条快递定位
 *@notice DO NOT CHANGE MY CODE!! OR YOU WILL DIE!
 */
define(function() {
  var fasttip = '<div data-name="fasttip" style="font-size:20px;line-height:3em;height:3em;width:3em;background-color:rgba(0,127,216,0.5);position:fixed;top:50%;margin-top:-30px;left:50%;margin-left:-30px;text-align:center;z-index:1000;font-weight:bolder;border-radius:3px;display:none;transition:opacity 1s cubic-bezier(0.1,0.57,0.1,1);-webkit-transition:opacity 1s cubic-bezier(0.1,0.57,0.1,1);opacity:0"></div>';
  var evtHandlers = {
    "fastMove": function(evt) {
      var $el = $(evt.target), self = this, conT = this.$container[0].getBoundingClientRect().top, vmap;
      var $match = this.$map.filter("[data-"+(this.vm||"vm")+"=" + (vmap = $el.data(this.vmap||"vmap")) + "]");
      clearTimeout(this.fmtid[0]);
      clearTimeout(this.fmtid[1]);
      self.$fasttip.css("opacity", "1");
      this.fmtid[0] = setTimeout(function() {
        self.$fasttip.css("opacity", 0)
      }, 1000);
      this.fmtid[1] = setTimeout(function() {
        self.$fasttip.hide();
      }, 2000);
      if ($match.length) {
        var ct = this.extra[vmap] == undefined ? $match[0].getBoundingClientRect().top - conT : this.extra[vmap];
        self.nextTop == self.curTop ? gn(1) : self.queue.unshift(gn);
      }
      self.$fasttip.text($el.text()).show();
      function gn(f){
        self.nextTop = ct;
        window.scrollTo(0, ct < 0 ? 0 : ct);
        setTimeout(function(){
          self.curTop = self.nextTop;
          f && e();
        }, 100);
        function e(){
          var tmp;
          (tmp = self.queue.shift()) && (self.queue = []) && tmp();
        }
      }
    },
    "move": function(evt) {
      evt.preventDefault();
      var self = this;
      var touch = evt.changedTouches[0], pos = {
        x: touch.clientX,
        y: touch.clientY
      };
      var $el;
      if (!($el = getMatchByPos.call(self, pos)))
        return;
      evtHandlers.fastMove.call(this, {
        "target": $el
      });
    }
  }
  var events = {
    "click": evtHandlers.fastMove,
    "touchstart": function(evt) {
      this.$el.css("backgroundColor", "rgb(226,234,255)")
    },
    "touchmove": evtHandlers.move,
    "touchend": function(evt) {
      this.$el.css("backgroundColor", "")
    }
  }
  function VFast(){}
  VFast.prototype.extend = function(o, isOwn) {
    var isPlainObject = Object.prototype.toString.call(o) == "[object Object]";
    if (!isPlainObject)
      return this;
    isOwn == undefined && (isOwn = true);
    for (var k in o) {
      if (isOwn)
        o.hasOwnProperty(k) && (this[k] = o[k]);
      else
        this[k] = o[k];
    }
    return this;
  }
  VFast.prototype.init = function() {
    this.$container = $(this.container);
    this.$el = $(this.el, this.$container);
    this.$map = $(this.map, this.$container);
    (this.$fasttip = $("[data-name=fasttip]")).length ? null : (this.$fasttip = $(fasttip).appendTo(document.body));
    this.events = {};
    this.tid = 0;
    this.curTop = 0;
    this.nextTop = 0;
    this.queue = [];
    return this.live()
  }
  VFast.prototype.live = function() {
    var $el;
    if(($el = this.$el).length)
      for (var k in events)
        $el.on(k, this.proxy(events[k], k));
    return this
  }
  VFast.prototype.unlive = function() {
    var evts = this.events;
    for (var k in evts)
      this.$el.off(k, evts[k]);
    return this
  }
  VFast.prototype.setMap = function(nmap) {
    return nmap && (delete this.$map) && (this.$map = this.$container.find(nmap)), this
  }
  VFast.prototype.setEl = function(nel) {
    return nel && (delete this.$el) && (this.$el = this.$container.find(nel)), this.live()
  }
  VFast.prototype.proxy = function(fn, k) {
    var s = this;
    return this.events[k] = function() {
      fn.apply(s, arguments)
    }
  }
  VFast.prototype.start = function() {
    this.fmtid = [];
    return this
  }
  /*
   *@name build: create fastmove
   *@param opt = {
   *   "container": "",
   *   "el": "", // touchmove(rs)
   *   "map": "", // stickers
   *   "vmap": "Y"||"vmap", // data-Y="y" to get the sticker's vm from el
   *   "vm": "X"||"vm", // data-X="x": get the sticker from map
   *   "extra": {} // 特殊处理，会通过data-[vmap]获取的值做判断，如果匹配，则快递定位的位置按匹配值处理
   * }
   */
  VFast.build = function(opt) {
    var that = new this;
    that.extend(opt).init().start();
    return that
  }
  return VFast;
  function getMatchByPos(pos) {
    var x = pos.x,
      y = pos.y;
    var clientRect, els;

    var delta, l = 0, h = (els = this.$el).length - 1, k = Math.floor((delta=h-l)/2);
    clientRect = h && els[0].getBoundingClientRect();
    if(x >= clientRect.left && x <= clientRect.right){
      while(delta>=0){
        clientRect = els[k].getBoundingClientRect();
        if(y < clientRect.top)
          h = k - 1;
        else if(y > clientRect.bottom)
          l = k + 1;
        else
          return els.eq(k);
        k = Math.floor((delta=h-l)/2) + l;
      }
    }
    return null;
  }
});