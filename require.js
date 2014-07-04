var _require = require;
var fs = _require('fs');
var global = {};


var Module = function(id, parent){
	this.id = id;
	this.parent = parent;
	this._require = _require;
	this.filename = undefined;
}


Module.cache = {};

Module.prototype._resolvePath = function(moduleName){
	var parent = this.parent;
	var modulePath = moduleName.split("/");

	if (modulePath[0] == ".") {
		if (parent && parent.filename) {
			var currentPath = parent.filename;
			var start = currentPath.split("/");
			start =  start.slice(0, start.length-1);
			modulePath =  modulePath.slice(1);
			moduleName = start.concat(modulePath).join("/");
		}else{
			modulePath[0] = "cloud";
			moduleName = modulePath.join("/");
		}
	}
	return moduleName;
}

Module.prototype._getRealPath = function(moduleName){
	var parent = this.parent;
	var isJS = this.checkJSFile(moduleName);
	if (isJS) {
		return isJS;
	};
	var isModule = this.checkModuleFolder(moduleName);
	if (isModule) {
		return isModule;
	};

	var isParseModule = this.checkParseModule(moduleName);
	if (isParseModule) {
		return isParseModule;
	}

	return moduleName;
}

Module.prototype.load = function(){
	var path = this._resolvePath(this.id); 
	if (path.split(".")[1] === "json") {
		this.exports = JSON.parse(fs.readFileSync(path));
	}else{
		this.filename = this._getRealPath(path);
		if (Module.cache[this.filename]) {
			return Module.cache[this.filename];
		};

		if (!this.filename || this.filename.indexOf('cloud') !== 0) {
			throw 'Module not found '+this.id;
		};
		var self = this;
		var f = fs.readFileSync(this.filename);
		module.children = module.children || [];
		module.children.push(self);
		//self.parent = module;
		var wrap = '(function(Parse, module, require, exports, console, global, _require){\n'+f+'\n;})(Parse, self, reqFunc(self), self.exports, console, global, self._require);';
		eval(wrap);
		Module.cache[this.filename] = self;
	}
	return this;
}

Module.prototype.checkJSFile = function(moduleName){
	if (moduleName.indexOf("cloud")!==0 && !this.parent) {
		moduleName = "cloud/" + moduleName;
	}
	var parts = moduleName.split(".");
	if (parts.length == 1) {
		moduleName += ".js"
	};
	if(fs.existsSync(moduleName)){

		return moduleName;
	}
	return;
}

Module.prototype.checkModuleFolder = function(moduleName){
	var exist = false;
	var parts = moduleName.split(".");
	if (parts.length == 1) {
		var lastChar = moduleName[moduleName.length-1];
		if (lastChar !== "/") {
			moduleName+="/";
		}
		moduleName += "index.js"
	}
	if(fs.existsSync(moduleName)){
		return moduleName;
	}
	return;
}

Module.prototype.checkParseModule = function(moduleName){
	var parent = this.parent;
	var parentPath = ['cloud'];
	if (parent && parent.filename) {
		parentPath = parent.filename.split("/");
	}
	var resolvedName;
	while(parentPath.length > 0 && !resolvedName){
		var mpath = parentPath.join('/')+'/parse_modules/'+moduleName;
		resolvedName = this.checkModuleFolder(mpath);
		parentPath = parentPath.slice(0, parentPath.length-1);
	}
	return resolvedName;
}

var reqFunc = function(parent){
	return function(moduleName){
		return require2(moduleName, parent);
	}
}

var require2 =  function(moduleName, parent){
	// Load modules only at runtime!
	if (!Parse.applicationId || !Parse.masterKey) {
		return;
	};

	try{
		if (moduleName.indexOf("/") < 0) {
			// Native Modules...
			var m = _require(moduleName);
			return m;
		};
	}catch(e){
		console.error(e);
	}
	//return;
	var m = new Module(moduleName, parent);

	return m.load().exports;
}

module.exports = require2;