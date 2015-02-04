//Bundle state machine examples into a javascript JSON.
console.log("Bundle all examples into a javascript JSON.");
var fs = require('fs');
var path = require('path');
var dir = require('node-dir');

var exampleDir = __dirname + '/../app/examples/';

var bundle = {};
var bundleFilename =  __dirname + '/../test/examples.js';

dir.readFiles(
        exampleDir,
        { match: /(.fsmcpp|.fsmjava|.fsmcs)$/},
        function(err, content, filename, next) {
            if (err) throw err;
            var baseName = path.basename(filename);
            bundle[baseName] = content;
            next();
        },
        function(err, files){
            if (err) throw err;
            var content = "var exampleMap = " + JSON.stringify(bundle, null, 4);
            var bundleFd = fs.openSync(bundleFilename, 'w');
            if(bundleFd){
                if(fs.writeSync(bundleFd, content) > 0){
                    console.log('State machine examples written to ', bundleFilename);
                } else {
                    throw "Cannot write to file " + bundleFilename;
                }
            } else {
                throw "Cannot open file " + bundleFilename;
            }
        });


