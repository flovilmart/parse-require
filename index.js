var _require = require;
var fs = _require('fs');
var path = require('path');
var global = {};


var Module = function(id, parent){
	this.id = id;
	this.parent = parent;
	this._require = _require;
	this.filename = undefined;
	this.__dir = undefined;
	this.exports = {} // otherwise the exports is undefined ...
}


Module.cache = {};

Module.prototype._resolvePath = function(moduleName){
	var parent = this.parent;
	//var modulePath = moduleName.split("/");
	if (moduleName.indexOf('cloud') === 0) {
		moduleName = moduleName.replace('cloud/', '');
	}
	var currentPath = ''
	if (moduleName[0] == ".") {
		if (parent && parent.filename) {
			currentPath = path.dirname(parent.filename);
			//var start = currentPath.split("/");
			//start =  start.slice(0, start.length-1);
			//modulePath =  modulePath.slice(1);
			//moduleName = path.join(currentPath, moduleName);//start.concat(modulePath).join("/");
		}else{
			//modulePath[0] = "cloud";
			//moduleName = path.join(currentPath, moduleName);//modulePath.join("/");
		}
	}
	var resolvedName = path.join(currentPath, moduleName);
	return resolvedName;
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
	var resolvedPath = this._resolvePath(this.id); 
	if (resolvedPath.split(".")[1] === "json") {
		this.exports = JSON.parse(fs.readFileSync(path.join('cloud', resolvedPath)));
	}else{
		this.filename = this._getRealPath(resolvedPath);
		if (Module.cache[this.filename]) {
			return Module.cache[this.filename];
		};

		/*if (!this.filename || this.filename.indexOf('cloud') !== 0) {
			throw 'Module not found '+this.id;
		};*/
		var self = this;
		var f = fs.readFileSync(path.join('cloud', this.filename));
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

	var parts = moduleName.split(".");
	if (parts.length == 1) {
		moduleName += ".js"
	};
	if(fs.existsSync(path.join('cloud', moduleName))){
		return moduleName;
	}
	return;
}

Module.prototype.checkModuleFolder = function(moduleName){
	var exist = false;
	var parts = moduleName.split(".");
	var resolvedName = moduleName;
	var resolvedNameJSON = moduleName;
	if (parts.length == 1) {
		var lastChar = resolvedName[resolvedName.length-1];
		if (lastChar !== "/") {
			resolvedName+="/";
		}
		resolvedNameJSON = resolvedName + "package.json";
		resolvedName += "index.js"

	}
	if(fs.existsSync(path.join('cloud', resolvedName))){
		return resolvedName;
	}

	if (fs.existsSync(path.join('cloud', resolvedNameJSON))) {
		var tpath = path.join('cloud', resolvedNameJSON);
		var jsonFile = fs.readFileSync(tpath);
		var json = JSON.parse(jsonFile);
		if (json.main) {
			var fullpath = path.join(moduleName, json.main);
			return fullpath;
		}
	}

	resolvedName = moduleName;



	return;
}

Module.prototype.checkParseModule = function(moduleName){
	var parent = this.parent;
	var parentPath = ['cloud'];
	if (parent && parent.filename) {
		parentPath = path.dirname(parent.filename).split("/");
	}
	var resolvedName;
	do{
		var mpath = path.join(parentPath,'parse_modules', moduleName);
		parentPath = mpath.split("/");
		resolvedName = this.checkModuleFolder(mpath);
		parentPath = parentPath.slice(0, parentPath.length-1);
	}while(parentPath.length > 1 && !resolvedName);

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