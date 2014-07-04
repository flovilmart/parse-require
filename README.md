parse-require
========

##Installation

#### With parse-module

	npm install -g parse-module // optional if you alread have it
	parse-module install flovilmart/parse-require require
	 

#### From parse-cli

install parse-cli

	npm install -g parse-cli
	
from your parse directory's root folder

	parse-cli install flovilmart/parse-require require
	
That will install require in
	`./cloud/parse_modules/require`
	

#### Other method

Get the index.js file and put it anywhere in your cloud folder (rename it require.js for the sake of understanding)


##How to use

in main.js :

    var require2 = require("cloud/parse_modules/require/index");
    require2("cloud/app");
    // same as
    require2("./app");
    
    /*
        Modules support
        cloud/mymodule/index.js
    */

    require2("mymodule");

    /*
        Load cloud/parse_modules/mymodule
    */

    require2("mymodule");

in cloud/mymodule/index.js

    /*
        Load files in the module
        resolve the current path
        injects require2 as require
        original require is available as _require
    */
    require("./lib/mymodule.js") 
    
    // Notice require is injected as require2 if the parent module was loaded with require2
    
Load json files:

    require("./hello.json")
    
You can still use the original require with

    _require("cloud/lib/mymodule/hello/world.js")
    

## Features

- Caching, loaded modules are cached with their full path
- JSON files, Adds support for json files
- parse_modules, adds supoort for parse_modules folder traversing
- Loads index.js in folders by default
- package.json parsing and loading, if your parse_module has a package.json file, it will load the main.
- relative paths (./, ../ etc..), improves code reliablitiy and flexibility
- fast
