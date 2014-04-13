/**
 * Created by Elia on 13/04/2014.
 */

/*jslint browser: true*/
/* require, global $, jQuery, CodeMirror*/

/* Defines an entry point for dependencies */

/* This sample, loads app.js asynchronously
require(['app'], function(app) {
    // We don't have to run anything here
});

*/




// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
require.config({
    "baseUrl": "../static/js/lib/jquery",
    "paths": {
        //"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min"        //CDN version
        jquery : "jquery-2.1.0"
        //jquery : "jquery-2.1.0.min" //Production ready version
    }
});



/*
//require sample for codemirror plugin

require(["cm/lib/codemirror", "cm/mode/htmlmixed/htmlmixed"
], function(CodeMirror) {
    CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        mode: "htmlmixed"
    });
});
 */

// Load the main app module to start the app
//requirejs(["main"]);

define(["jquery"], function($) {

});

require(['app'], function(app) {
    // We don't have to run anything here
});




/**
 * This function is responsible for loading CSS modules
 * @param url the file CSS URL in the application
 * @returns true iff the CSS module was successfully loaded
 */
function cssLoader(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    try {
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    catch (err) {
        return false;
    }
    return true;
}




