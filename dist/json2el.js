"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var El = function El(el, dom) {
	this.$rootRef = el || null;
	this.$refs = {};
	this.$data = {};
	Object.defineProperty(this, "_d", {
		enumerable: false,
		writable: true,
		value: {}
	});
	Object.defineProperty(this, "_d_ref", {
		enumerable: false,
		writable: true,
		value: {}
	});

	this.clsEl(el);
	this.dom = this.mkAllEl({
		ref: this.$rootRef,
		child: Array.isArray(dom) && dom || [dom]
	}).child;

	return this;
};

El.prototype = {
	$setAttr: function $setAttr(keysName, key, value) {
		if (!keysName || !key || !value) {
			return;
		}
		if (_typeof(this._d[keysName]) !== 'object') {
			return;
		}
		var self = this;
		this._d[keysName + '.' + key] = value;

		Object.defineProperty(self._d[keysName], key, {
			get: function get() {
				return self._d[keysName + '.' + key];
			},
			set: function set(_value) {
				var option = {
					ref: self._d_ref[keysName],
					attr: {}
				};
				option.attr[key] = _value;
				self.updAttr(option);

				self._d[keysName + '.' + key] = _value;
			},
			enumerable: true,
			configurable: true
		});

		self._d[keysName][key] = value;
	},
	setVal: function setVal(data) {
		var _this = this;

		for (var key in data) {
			var deepKey = key.split('.');
			var firstKey = deepKey.shift();
			if (deepKey.length) {
				var _ret = function () {
					var deepData = _this.$data[firstKey];
					var lastKey = deepKey.pop();

					deepKey.map(function (deepKey) {
						deepData = deepData[deepKey];
					});
					deepData[lastKey] = data[key];
					return "continue";
				}();

				if (_ret === "continue") continue;
			}
			this.$data[key] = data[key];
		}

		return this;
	},
	val: function val(key, _default) {
		return {
			model: true,
			key: key,
			default: _default
		};
	},
	bidData: function bidData(domRef, info) {
		var _this2 = this;

		if (info.model === false) {
			return false;
		}

		var self = this;
		var cur = void 0;
		var keysName = info.key;
		info.key = info.key.split('.');
		var lastKeyName = info.key.pop();

		if (Array.isArray(info.key) && info.key.length) {
			var firstKeyName = info.key.shift();
			cur = this.$data[firstKeyName] = {};

			info.key.reverse().map(function (curKey, index, arr) {
				_this2.$data[firstKeyName][curKey] = JSON.parse(JSON.stringify(_this2.$data[firstKeyName]));
				delete _this2.$data[firstKeyName][arr[index - 1]];
				return curKey;
			}).reverse().map(function (curKey, index, arr) {
				cur = cur[curKey];
			});
		} else {
			cur = this.$data;
		}

		self._d_ref[keysName] = domRef;

		Object.defineProperty(cur, lastKeyName, {
			get: function get() {
				return self._d[keysName];
			},
			set: function set(value) {
				var option = {
					ref: domRef
				};
				option[info.type] = value;
				self.updEl(option);

				if (Array.isArray(value)) {
					self._d[keysName] = self.bidWithArray(value, function () {
						var option = {
							ref: domRef
						};
						option[info.type] = Array.from(this);
						self.updEl(option);
					});
					return;
				}

				self._d[keysName] = value;

				if (info.type === 'attr' && (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object') {
					for (var key in value) {
						self.$setAttr(keysName, key, value[key]);
					}
				}
			},
			enumerable: true,
			configurable: true
		});

		cur[lastKeyName] = info.default;
	},
	updAttr: function updAttr(dom) {
		var el = dom.ref;

		if (dom.clearAttr) {
			Array.from(el.attributes).map(function (attr) {
				el.removeAttribute(attr.nodeName);
			});
		}

		for (var key in dom.attr) {
			el.setAttribute(key, dom.attr[key]);
		}

		return el;
	},
	updEl: function updEl(dom) {
		if ((typeof dom === "undefined" ? "undefined" : _typeof(dom)) !== 'object' || !dom.ref) {
			return dom;
		}
		var el = dom.ref;

		if (dom.attr) {
			dom.clearAttr = true;
			this.updAttr(dom);
		}

		(dom.text || dom.child) && this.clsEl(dom.ref);

		if (dom.text) {
			el.appendChild(document.createTextNode(dom.text));
		}

		if (dom.child) {
			this.mkAllEl({
				ref: el,
				child: Array.isArray(dom.child) && dom.child || [dom.child]
			});
		}

		return el;
	},
	mkEl: function mkEl(dom) {
		if ((typeof dom === "undefined" ? "undefined" : _typeof(dom)) !== 'object') {
			return dom;
		}
		var el = void 0;
		if (dom.tag) {
			el = document.createElement(dom.tag);
			for (var key in dom.attr) {
				el.setAttribute(key, dom.attr[key]);
			}
			if (dom.text) {
				el.appendChild(document.createTextNode(dom.text));
			}
		} else {
			el = document.createTextNode(dom.text);
		}

		return el;
	},
	mkAllEl: function mkAllEl(dom) {
		var _this3 = this;

		var textIsModel = typeof dom.text === 'string' && /^\$data(\.\w+)+/.test(dom.text) && (dom.text = { model: true, type: 'text', key: /(\.\w+)+$/.exec(dom.text)[0].slice(1), default: '' });

		var attrIsModel = typeof dom.attr === 'string' && /^\$data(\.\w+)+/.test(dom.attr) && (dom.attr = { model: true, type: 'attr', key: /(\.\w+)+$/.exec(dom.attr)[0].slice(1), default: {} });

		var childIsModel = typeof dom.child === 'string' && /^\$data(\.\w+)+/.test(dom.child) && (dom.child = { model: true, type: 'child', key: /(\.\w+)+$/.exec(dom.child)[0].slice(1), default: [] });

		if (!dom.ref) {
			var d = JSON.parse(JSON.stringify(dom));
			textIsModel && (d.text = d.text.default);
			attrIsModel && (d.attr = d.attr.default);

			dom.ref = this.mkEl(d);
		}

		// handle child
		if (!childIsModel) {
			if (Array.isArray(dom.child)) {
				dom.child = dom.child.map(function (domRow) {
					if (typeof domRow === 'string') {
						domRow = {
							tag: '',
							text: domRow
						};
					}
					var el = _this3.mkAllEl(domRow);
					dom.ref.appendChild(el.ref);
					return el;
				});
			} else if (dom.child) {
				var el = this.mkAllEl(dom.child);
				dom.ref.appendChild(el.ref);
			}
		}

		// save dom when needed
		if (dom.name && dom.name.length) {
			this.$refs[dom.name] = dom.ref;
		}

		// binding
		textIsModel && this.bidData(dom.ref, dom.text);
		attrIsModel && this.bidData(dom.ref, dom.attr);
		childIsModel && this.bidData(dom.ref, dom.child);

		return dom;
	},
	clsEl: function clsEl(el) {
		Array.from(el.childNodes).map(function (el) {
			el.parentElement.removeChild(el);
		});
	},
	bidWithArray: function bidWithArray(arr, callback) {
		var arrayMethod = Object.create(Array.prototype);
		['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
			Object.defineProperty(arrayMethod, method, {
				value: function value() {
					var original = Array.prototype[method];
					var result = original.apply(this, Array.from(arguments));

					callback.apply(this, arguments);

					return result;
				},
				enumerable: true,
				writable: true,
				configurable: true
			});
		});

		var BArray = function BArray() {
			this.push.apply(this, arguments);
			return this;
		};

		BArray.prototype.constructor = BArray;
		BArray.prototype = arrayMethod;

		return BArray.apply(new BArray(), arr);
	}
};