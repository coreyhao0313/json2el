let El = function(el, dom) {
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
		ref:   this.$rootRef,
		child: Array.isArray(dom) && dom || [dom]
	}).child;

    return this;
}

El.prototype = {
	$setAttr: function(keysName, key, value){
		if(!keysName || !key || !value){
			return;
		}
		if(typeof this._d[keysName] !== 'object'){
			return;
		}
		const self = this;
		this._d[keysName + '.' + key] = value;

		Object.defineProperty(self._d[keysName], key, {
			get: function() { return self._d[keysName + '.' + key]; },
			set: function(_value) {
				let option = {
					ref: self._d_ref[keysName],
					attr: {}
				};
				option.attr[key] = _value;
				self.updAttr(option);

				self._d[keysName + '.' + key] = _value;
			},
			enumerable:   true,
			configurable: true
		});

		self._d[keysName][key] = value;
	},
	setVal:   function(data) {
		for (let key in data){
			let deepKey = key.split('.');
			let firstKey = deepKey.shift();
			if (deepKey.length) {
				let deepData = this.$data[firstKey];
				let lastKey = deepKey.pop();

				deepKey.map((deepKey)=>{
					deepData = deepData[deepKey];
				});
				deepData[lastKey] = data[key];
				continue;
			}
			this.$data[key] = data[key];
		}

		return this;
	},
	val: function(key, _default){
		return {
			model:   true,
			key:     key,
			default: _default,
		};
	},
	bidData: function(domRef, info){
		if (info.model === false){
			return false;
		}

		let self = this;
		let cur;
		let keysName = info.key;
		info.key = info.key.split('.');
		let lastKeyName = info.key.pop();

		if (Array.isArray(info.key) && info.key.length){
			let firstKeyName = info.key.shift();
			cur = this.$data[firstKeyName] = {};

			info.key
				.reverse()
				.map((curKey, index, arr)=>{
					this.$data[firstKeyName][curKey] = JSON.parse(JSON.stringify(this.$data[firstKeyName]));
					delete this.$data[firstKeyName][arr[index - 1]];
					return curKey;
				})
				.reverse()
				.map((curKey, index, arr)=>{
					cur = cur[curKey];
				});
		} else {
			cur = this.$data;
		}

		self._d_ref[keysName] = domRef;

		Object.defineProperty(cur, lastKeyName, {
			get: function() { return self._d[keysName]; },
			set: function(value) {
				let option = {
					ref: domRef
				};
				option[info.type] = value;
				self.updEl(option);

				if (Array.isArray(value)){
					self._d[keysName] = self.bidWithArray(value, function(){
						let option = {
							ref: domRef
						};
						option[info.type] = Array.from(this);
						self.updEl(option);
					})
					return;
				}

				self._d[keysName] = value;

				if(info.type === 'attr' && typeof value === 'object'){
					for(let key in value){
						self.$setAttr(keysName, key, value[key]);
					}
				}
			},
			enumerable:   true,
			configurable: true
		});

		cur[lastKeyName] = info.default;
	},
	updAttr: function(dom){
		let el = dom.ref;

		if(dom.clearAttr){
			Array.from(el.attributes).map((attr)=>{
				el.removeAttribute(attr.nodeName);
			});
		}

        for (let key in dom.attr){
        	el.setAttribute(key, dom.attr[key]);
		}

		return el;
	},
	updEl: function(dom){
		if (typeof dom !== 'object' || !dom.ref){
			return dom;
		}
		let el = dom.ref;

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
				ref:   el,
				child: Array.isArray(dom.child) && dom.child || [dom.child]
			});
		}

		return el;
	},
	mkEl: function(dom){
		if (typeof dom !== 'object'){
			return dom;
		}
		let el;
		if (dom.tag){
            el = document.createElement(dom.tag);
            for (let key in dom.attr){
                el.setAttribute(key, dom.attr[key]);
            }
			if (dom.text){
            	el.appendChild(document.createTextNode(dom.text));
			}
		} else {
			el = document.createTextNode(dom.text);
		}

		return el;
	},
	mkAllEl: function(dom){
		 const textIsModel = typeof dom.text === 'string' && /^\$data(\.\w+)+/.test(dom.text) &&
		  (dom.text = { model: true, type: 'text', key: /(\.\w+)+$/.exec(dom.text)[0].slice(1), default: '' });

		 const attrIsModel = typeof dom.attr === 'string' && /^\$data(\.\w+)+/.test(dom.attr) &&
		  (dom.attr = { model: true, type: 'attr', key: /(\.\w+)+$/.exec(dom.attr)[0].slice(1), default: {} });

		 const childIsModel = typeof dom.child === 'string' && /^\$data(\.\w+)+/.test(dom.child) &&
		  (dom.child = { model: true, type: 'child', key: /(\.\w+)+$/.exec(dom.child)[0].slice(1), default: [] });

		if (!dom.ref){
			const d = JSON.parse(JSON.stringify(dom));
			textIsModel && (d.text = d.text.default);
			attrIsModel && (d.attr = d.attr.default);

			dom.ref = this.mkEl(d);
    	}

    	// handle child
		if (!childIsModel){
			if (Array.isArray(dom.child)){
				dom.child = dom.child
					.map((domRow)=>{
						if (typeof domRow === 'string'){
							domRow = {
								tag:  '',
								text: domRow
							};
						}
						const el = this.mkAllEl(domRow);
						dom.ref.appendChild(el.ref);
						return el;
					});
			} else if (dom.child) {
				const el = this.mkAllEl(dom.child);
				dom.ref.appendChild(el.ref);
			}
		}

         // save dom when needed
         if (dom.name && dom.name.length){
         	this.$refs[dom.name] = dom.ref;
         }

         // binding
        textIsModel && this.bidData(dom.ref, dom.text);
        attrIsModel && this.bidData(dom.ref, dom.attr);
        childIsModel && this.bidData(dom.ref, dom.child);

		return dom;
	},
	clsEl: function(el){
	    Array.from(el.childNodes)
	        .map(function(el){
	            el.parentElement.removeChild(el);
	        });
	},
	bidWithArray: function(arr, callback){
		const arrayMethod = Object.create(Array.prototype);
		[
			'push',
			'pop',
			'shift',
			'unshift',
			'splice',
			'sort',
			'reverse'
		].forEach(function(method){
			Object.defineProperty(arrayMethod, method,{
				value: function(){
					let original = Array.prototype[method];
					let result = original.apply(this, Array.from(arguments));

					callback.apply(this, arguments);

					return result;
				},
				enumerable:   true,
				writable:     true,
				configurable: true
			})
		});

		const BArray = function(){
			this.push.apply(this, arguments);
			return this;
		}

		BArray.prototype.constructor = BArray;
		BArray.prototype = arrayMethod;

		return BArray.apply(new BArray, arr);
	}
};