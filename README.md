require.js for Parse
========

##How to use

in main.js :

    var require2 = require("cloud/require.js");
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
- parse_modules, adds supoort for parse_modules folder traversing (pmm anyone?)
- relative paths, improves code reliablitiy and flexibility
- fast

