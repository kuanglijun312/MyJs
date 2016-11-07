
window.$ = function(selector, context) {
  // an object containing the matching keys and native get commands
  var method = 'querySelectorAll';
  if(selector[0]=='#') {
      method = 'getElementById';
      selector = selector.slice(1);
  }
  var el = (((context === undefined) ? document: context)[method](selector));
  if(!el) return null;
  return ((el.length < 2) ? el[0]: el);
};

function extend() {
    var args = [].slice.call(arguments);
    for(var i=1,len=args.length; i < len; i++) {
        if(args[i]) {
            for(var key in args[i]) {
                var val = args[i][key];
                if(Object.prototype.toString.call(val) == "[object Object]") {
                    args[0][key] = extend({},val);
                } else {
                    args[0][key] = val;
                }
            }
        }
    }
    return args[0];
}

extend(window.Element.prototype,{
    '__uniqID': function(string) {
        string = string || '';
        return string + Math.random().toString(36).substr(2, 10);
    },
    '__evalDateset': function(old, nd) {
        if (old) {
            return old + '|' + nd;
        } else {
            return nd;
        }
    },
    '__camelize' : function(s) {
		return s.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
	},
    each: function(fn) {
        fn.call(this,this,0);
    },
    matches: Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1;
                },
    closestEl: function(selector, root) {
        var el = this;
        while (el) {
            parent = el.parentElement;
            if (parent && parent.matches(selector)) {
                return parent;
            }
            el = parent;
            if(root && el === root) { //只到最上级
                break;
            }
        }
        return null;
    },
    on: function(eventType, selector, callback) {
        eventType = eventType.split(' ');
        var eid = this.__uniqID(), self = this;

        for (var i = 0; i < eventType.length; i++) {
            if(typeof selector == 'function') {
                window[eid] = selector;
                this.dataset[eventType[i]] = this.__evalDateset(this.dataset[event], eid);
                this.addEventListener(eventType[i], window[eid]);
            } else {
                window[eid] = function(e) {
                    var els = this.querySelectorAll(selector),
                        target = e.target;
                    els.each(function(el,i) {
                        if(el == target) {
                            callback.call(target,e);
                            e.stopPropagation();
                            return false;
                        } else if(el.closestEl(selector,self)) {
                            callback.bind(target,e);
                            e.stopPropagation();
                            return false;
                        }
                    });
                };
                this.addEventListener(eventType[i], window[eid]);
                self.dataset[eventType[i]] = self.__evalDateset(self.dataset[event], eid);
            }
        }
        return this;
    },
    off: function(eventType, callback) {
        if(handle) {
            this.removeEventListener(eventType, callback);
        } else {
            if(callback = el.dataset[event]) {
                callback = handle.split('|');
                for(var i =0, len = handle.length; i < len; i ++) {
                    this.off(eventType, callback[i]);
                }
                this.dataset[eventType] = '';
            }
        }
    },
    addClass: function(cls) {
        if (!this.hasClass(cls)) this.className += " " + cls;
        return this;
    },
    removeClass: function(cls){
        if (this.hasClass(cls)) {
            this.className = this.className.replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ' ');
        }
        return this;
    },
    hasClass: function(cls) {
        return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    css : function() {
        var self = this;
		if(typeof(arguments[0]) == "object"){
			var st = arguments[0];
			var elmStyle = this.style;
			for(var itm in st) {
				switch(itm) {
					case 'float':
						elmStyle['cssFloat'] = elmStyle['styleFloat'] = st[itm];
						break;
					case 'opacity':
						elmStyle.opacity = st[itm];
						elmStyle.filter = "alpha(opacity=" + Math.round(st[itm]*100) + ")";
						break;
					case 'className':
						this.className = st[itm];
						break;
					case 'width':
					case 'height':
						elmStyle[itm] = String(st[itm]).indexOf('%') > -1 ? st[itm] : parseInt(st[itm])+'px';
						break;
					default:
						if(arguments[1] !== true) {
                            var prefix = ['','-webkit-','-moz-','-o-'];
                            for(var i=0,len = prefix; i < len; i++) {
                                var it = self.__camelize(prefix[i]+itm);
                                if(typeof(elmStyle[it]) != 'undefined') {
									elmStyle[it] = st[itm];
                                    break;
								}
                            }
						} else {
							elmStyle[self.__camelize(itm)] = st[itm];
						}
				}
			}
			return this;
		}else if(typeof(arguments[0]) == "string"){
			var cssRule = arguments[0],d = arguments[1];
			var doc = document.defaultView;
			if(d){
				var obj = {};
				obj[cssRule] = d;
				this.css(obj);
				return this;
			}else if(this.nodeType == 1){
				var elmStyle = this.style;
				var oCssRule = cssRule;
                var prefix = ['','-webkit-','-moz-','-o-'];
                for(var i=0,len = prefix; i < len; i++) {
                    var it = prefix[i],
                        _it = self.__camelize(it+cssRule);
                    if(typeof(elmStyle[_it]) != 'undefined') {
                        cssRule = _it;
						oCssRule = it+oCssRule;
                        break;
                    }
                }
				return (doc && doc.getComputedStyle) ? doc.getComputedStyle( this, null ).getPropertyValue(oCssRule) : this.currentStyle[ cssRule ];
			}
		}
	},
    attr: function(at) {
		if(typeof(at)=='object'){
			for(var itm in at) {
				if(itm=='style'){
					this.style.cssText = at[itm];
				}else{
					this.setAttribute(itm,at[itm])
				}

			}
			return this;
		}else if(typeof(at)=='string'){
			if(arguments.length==2){
				this[at] = arguments[1];
			}else{
				if(at=='style'){
					return this.style.cssText;
				}else{
					return this.getAttribute(at);
				}
			}
			return this;
		}
	},
    html: function(html) {
        this.innerHTML = html;
    },
    hide: function() {
        this.css({'display':'none'},true);
    },
    show: function() {
        this.css({'display':'block'},true);
    }
});

extend(window.NodeList.prototype,{
    each: function(fn) {
        var nodes = [].slice.call(this);
        for(var i=0,len=nodes.length; i < len; i++) {
            if(fn.call(nodes[i],nodes[i],i,nodes) === false) break;
        }
    },
    on: function(eventType, selector, callback){
        this.each(function(el){
          el.on(eventType, selector, callback);
        });
        return this;
    },
    off: function(eventType, callback) {
        this.each(function(el){
          el.off(eventType, callback);
        });
        return this;
    },
    addClass: function(name){
        this.each(function(el) {
            el.classList.add(name);
        });
        return this;
    },
    removeClass: function(name){
        this.each(function(el) {
            el.classList.remove(name);
        });
        return this;
    },
    html: function(html) {
        this.each(function(el) {
            el.html(html);
        });
        return this;
    },
    hide: function() {
        this.each(function(el) {
            el.hide();
        });
    },
    show: function() {
        this.each(function(el) {
            el.show();
        });
    }
});
