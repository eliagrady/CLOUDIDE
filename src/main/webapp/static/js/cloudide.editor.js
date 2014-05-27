/* cloud ide editor javascript */
/*jslint browser: true*/
/*global $, jQuery, CodeMirror*/

/**
 * Class containing editor properties and functions
 */
var _cldEditor = (function() {
    "use strict";
    var CloudIde = {
        settings: {
            appSettings: {
                //Active project in editor
                currentProject : {},
                projects : []
            }
        },
        //CodeMirror instances
        cm: {
            html : {},
            js : {},
            css : {},
            cache : function (projectId, arr) {
                var storage = {};
                if(arr && arr.length > 0) {
                    storage[projectId] = arr;
                }
                else {
                    return storage[projectId];
                }
            }
        },
        getSettings: function () {
            return CloudIde.settings.appSettings;
        },
        //here we will add callbacks to update the status bar if necessary
        projectHandler : {
            currentId : 0,
            nextId : function() {
                this.currentId +=1;
                var id = this.currentId;
                return id;
            },
            projectTemplate : {
                id : 0,
                code : {
                    html : "",
                    js : "",
                    css : ""
                }, //Base64 encoded strings
                name : "New project",
                created : new Date(),
                modified : new Date()
            },
            getProjects : function() {
                return CloudIde.projects;
            },
            addProject : function(project) {
                var context = this.getProjects();
                //var length = Array.prototype.push.call(context,project);
                var length = context.push(project);

                console.log("=================");
                console.log(length+ " projects listed:");
                for(var prj in context) {
                    console.log(prj);
                };
                console.log("=================");
            },
            createNewProjectFromTemplate : function() {
//                //Save current project before creating a new one
//                try {
//                    CloudIde.projectHandler.addCurrentProjectToProjectsArray();
//                }
//                catch (err) {
//                    console.log("unable to add current project. current project is:"+CloudIde.getSettings().currentProject);
//                }

                // Deep copy the template using the fastest performing method:
                // http://jsperf.com/cloning-an-object/135 (revision 135)
//                function clone(obj) {
//                    var target = {};
//                    for (var i in obj) {
//                        if (obj.hasOwnProperty(i)) {
//                            target[i] = obj[i];
//                        }
//                    }
//                    return target;
//                }
                //var newProject = jQuery.extend(true, {}, CloudIde.projectHandler.projectTemplate);
                var newProject = JSON.parse(JSON.stringify(CloudIde.projectHandler.projectTemplate));
                //var newProject = clone(CloudIde.projectHandler.projectTemplate);
                //Change ID:
                var nextId = CloudIde.projectHandler.nextId();
                newProject.id = nextId;
                newProject.created = new Date();
                return newProject;
            },
            addCurrentProjectToProjectsArray : function() {
                CloudIde.projectHandler.addProject(CloudIde.getSettings().currentProject);
            },
            deleteProject : function(projectId) {
                delete CloudIde.getSettings().projects[projectId];
            },
            updateCurrentProject : function() {
                var htmlCode = CloudIde.cm.html.getDoc().getValue();
                var jsCode = CloudIde.cm.js.getDoc().getValue();
                var cssCode = CloudIde.cm.css.getDoc().getValue();
                //Encoding
                htmlCode =  encodeURI($.base64.encode(htmlCode));
                jsCode =  encodeURI($.base64.encode(jsCode));
                cssCode =  encodeURI($.base64.encode(cssCode));

                var cp = CloudIde.getSettings().currentProject;
                cp.name = CloudIde.editor.getCurrentProjectName();
                cp.modified = new Date();
                cp.code.html = htmlCode;
                cp.code.js = jsCode;
                cp.code.css = cssCode;
            },
            setCurrentProjectById : function(id) {
                try {
                    var settings = CloudIde.getSettings();
                    var project = settings.projects[id];
                    settings.currentProject = project;
                    var cached = CloudIde.cm.cache(id);
                    CloudIde.projectHandler.swapDocs(cached);
                }
                catch (err) {
                    console.log(err.stack);
                }
            },
            swapDocs : function(cache) {
                var newHtmlDoc,newJsDoc,newCssDoc;
                var projectId = CloudIde.getSettings().currentProject.id;

                if(cache && cache.length > 2) {
                    newHtmlDoc = cache[0];
                    newJsDoc = cache[1];
                    newCssDoc = cache[2];
                }
                else {
                    var newHtmlCode = CloudIde.getSettings().currentProject.code.html;
                    var newJsCode = CloudIde.getSettings().currentProject.code.js;
                    var newCssCode = CloudIde.getSettings().currentProject.code.css;

                    newHtmlDoc = CodeMirror.Doc($.base64.decode(newHtmlCode));
                    newJsDoc = CodeMirror.Doc($.base64.decode(newJsCode));
                    newCssDoc = CodeMirror.Doc($.base64.decode(newCssCode));
                }
                var oldHtmlDoc = CloudIde.cm.html.swapDoc(newHtmlDoc);
                var oldJsDoc = CloudIde.cm.js.swapDoc(newJsDoc);
                var oldCssDoc = CloudIde.cm.css.swapDoc(newCssDoc);
                CloudIde.cm.cache(projectId,[oldHtmlDoc,oldJsDoc,oldCssDoc]);
            }
        },
        editor : {
            do : function(actionName,args) {
                try {
                    var func = CloudIde.editor[actionName];
                    CloudIde.editor.apply(CloudIde.editor[actionName],args);

                    //CloudIde.editor[actionName](args);
                }
                catch (err) {
                    console.log(err.message);
                }
            },
            toggleFullscreen : function() {
                var elem = $(".cldFullscreenBtn");
                var on,off;
                if($(elem[0]).hasClass("hidden")) {
                    off = elem[0];
                    on = elem[1];
                }
                else {
                    on = elem[0];
                    off = elem[1];
                }
                $(on).addClass("hidden");
                $(off).removeClass("hidden");
            },
            getCurrentProjectName : function() {
                return $('#cldProjectName').get(0).text;
            },
            loadProjectsToExplorer : function() {
                var projects = CloudIde.projectHandler.getProjects();
                //Prepare then UL
                var ul = $('<ul></ul>').addClass("nav").addClass("nav-sidebar");
                var project;
                for(var i = 0 ; i < projects.length ; i++ ) {
                    project = projects.pop();
                    var funcDesc = '_cldEditor.editorActions("selectProject",'+project.id+')';
                    var a = $('<a></a>').attr('href','#').attr('onclick',funcDesc).text(project.name);
                    var li = $('<li></li>').attr('projectId',project.id).attr('selectedProject','false');
                    li.append(a);
                    ul.append(li);
                }
                $('#cldProjectExplorer').append(ul);
            },
            selectProject : function(projectId) {
                //Deactivate last 'current project'
                var lastActiveSelector = '[selectedProject=true]';
                var lastActive = $(lastActiveSelector).attr('selectedProject','false').removeClass("active");
                //console.log(lastActive);
                //Activate 'current project'
                var cssSelector = '[projectId='+projectId+']';
                var nowActive = $(cssSelector).attr('selectedProject','true').addClass("active");
                //console.log(nowActive);
                //Bring to scope:
                CloudIde.projectHandler.setCurrentProjectById(projectId);
            },
            createNewProject : function() {
                var newProject = CloudIde.projectHandler.createNewProjectFromTemplate();
                CloudIde.projectHandler.addProject(newProject);
                CloudIde.editor.loadProjectsToExplorer();
            }
        },
        /**
         * Returns a CodeMirror configuration object, in JSON notation (json string)
         * of the requested programming language. (codemirror/modes folder)
         * @param lang the programming language to return it's configuration object
         * @return JSON notation (json string) configuration object
         */
        getCodeMirrorDefaultConfig: function (lang) {
            var config = {
                htmlmixed : {
                    value: "Hello World!\n", //TODO replace with the Document module
                    mode: {
                        name: "htmlmixed",
                        globalVars: true
                    },
                    parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
                    stylesheet: ["css/xmlcolors.css", "css/jscolors.css", "css/csscolors.css"],
                    indentUnit: 2, //Integer number for indentation spaces
                    smartIndent: true, //Indentation is context sensitive (according to the given mode)
                    tabSize: 2, //width of tabs
                    indentWithTabs: true, //true means indent with tabs instead of spaces
                    lineNumbers: true,
                    extraKeys: {
                        "Ctrl-Space": "autocomplete"
                    },
                    gutters: ["CodeMirror-lint-markers"],
                    getAnnotations: [""],
                    lint: false,
                    autoCloseBrackets: true,
                    path: "js/",
                    autofocus : true
                },
                js : {
                    value: "function myScript() {return 100;}\n", //TODO replace with the Document module
                    mode: {
                        name: "javascript",
                        globalVars: true
                    },
                    indentUnit: 2, //Integer number for indentation spaces
                    smartIndent: true, //Indentation is context sensitive (according to the given mode)
                    tabSize: 2, //width of tabs
                    indentWithTabs: true, //true means indent with tabs instead of spaces
                    lineNumbers: true,
                    extraKeys: {
                        "Ctrl-Space": "autocomplete"
                    },
                    gutters: ["CodeMirror-lint-markers"],
                    lint: true,
                    autoCloseBrackets: true,
                    autofocus : true
                },
                css : {
                    value: ".body {}\n", //TODO replace with the Document module
                    mode: {
                        name: "css",
                        globalVars: true
                    },
                    indentUnit: 2, //Integer number for indentation spaces
                    smartIndent: true, //Indentation is context sensitive (according to the given mode)
                    tabSize: 2, //width of tabs
                    indentWithTabs: true, //true means indent with tabs instead of spaces
                    lineNumbers: true,
                    extraKeys: {
                        "Ctrl-Space": "autocomplete"
                    },
                    gutters: ["CodeMirror-lint-markers"],
                    lint: true,
                    autoCloseBrackets: true,
                    autofocus : true
                }
            };
            switch (lang) {
                case "html" : return config.htmlmixed;
                case "javascript" : return config.js;
                case "css" : return config.css;
                default : throw new Error("undefined language");
            }
        },
        updateStatusBar: function (text, timeout, callback) {
            $('#cldStatusbar').get(0).val(text);
            if (timeout !== undefined) {
                //clears the status bar
                setTimeout(this.updateStatusBar("", undefined, undefined), timeout);
            }
            return callback();//TODO check for security and necessity of this op
        },
        save: function () {
            //Update the current project
            CloudIde.projectHandler.updateCurrentProject();
            CloudIde.projectHandler.addCurrentProjectToProjectsArray();


            var compId;
            var instanceId;
            try {
                instanceId = Wix.Utils.getInstanceId() || "";
                compId = Wix.Utils.getOrigCompId() || "";
            }
            catch (err) {
                console.log("Not in Wix editor"); //TODO check if in Wix editor
            }

            if(CloudIde.mode == 'debug') {
                console.log("about to send window.debugMode = " + CloudIde.mode);
                compId = 'debug';
                instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                console.log("set compId to: "+compId);
            }
            //Saving the appSettings JSON to the server
            $.ajax({
                'type': 'post',
                'url': "/app/save",
                'dataType': "json",
                'contentType': 'application/json; chatset=UTF-8',
                'data': JSON.stringify({
                    compId: compId,
                    settings: CloudIde.settings,
                    mode: _cldEditor.mode
                }),
                'cache': false,
                'success': function (res) {
                    console.log("save completed");
                    if (_cldEditor.mode === "debug") {
                        window.alert("save completed");
                    }
                    else {
                        CloudIde.updateStatusBar("Saved successfully", 5000, undefined);
                    }
                    Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
                },
                'error': function (res) {
                    if (_cldEditor.mode === "debug") {
                        console.log('error updating data with message ' + res.responseText);
                    }
                }
            });
        },
        loadAllCodeMirrorAddons: function (list) {
            //CloudIde.loadCodeMirrorAddon("fold/foldcode.js");
            CloudIde.loadCodeMirrorAddon("edit/closebrackets.js");
            CloudIde.cm.setOption("autoCloseBrackets", true);
        },
        loadCodeMirrorAddon: function (codeMirrorRelPath) {
            var codeMirrorBaseURL = "../static/lib/codemirror/codemirror-4.0/addon/";
            CloudIde.loadjscssfile(codeMirrorBaseURL + codeMirrorRelPath, "js");


//        $.getScript(codeMirrorBaseURL+codeMirrorRelPath, function( data, textStatus, jqxhr ) {
//            console.log( data ); // Data returned //TODO remove data logging which exposes CodeMirror's internals
//            console.log( textStatus ); // Success
//            console.log( jqxhr.status ); // 200
//            console.log( "Finished loading "+codeMirrorRelPath);
//        });
        },
        loadjscssfile: function (filename, filetype) {
            if (filetype === "js") { //if filename is a external JavaScript file
                var fileref = document.createElement('script');
                fileref.setAttribute("type", "text/javascript");
                fileref.setAttribute("src", filename);
            }
            else if (filetype === "css") { //if filename is an external CSS file
                var fileref = document.createElement("link");
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", filename);
            }
            if (typeof fileref !== "undefined") {
                document.getElementsByTagName("head")[0].appendChild(fileref);
            }
        },
        replaceDoc: function () {
            var text = "<script src=\"lib/codemirror.js\"></script>\n<link rel=\"stylesheet\" href=\"../lib/codemirror.css\">\n<script src=\"mode/javascript/javascript.js\"></script>\n";
            return CloudIde.cm.swapDoc(CodeMirror.Doc(text, "javascript", 1));
        }
    };
    // Public functions
    return {
        init: function(settings){
            if(settings) {
                if(settings.appSettings.currentProject == undefined || settings.appSettings.projects == undefined) {
                    //skip setting the new setting
                }
                else {
                    CloudIde.settings = settings;
                    CloudIde.currentProject = settings.appSettings.currentProject;
                    CloudIde.projects = settings.appSettings.projects;
                }
            }
            else {
                console.log("Error initializing, settings is:");
                console.log(settings);
            }
            //Initialize template project
            if(CloudIde.getSettings().currentProject == undefined) {
                var blankProject = CloudIde.projectHandler.createNewProjectFromTemplate();
                CloudIde.getSettings().currentProject = blankProject;
                CloudIde.projectHandler.setCurrentProjectById(blankProject.id);
            }


            //Initialize menu segment
            //Initialize project explorer segment
            //Initialize Editor tab buttons
            $('#cldEditorTabs a[href="#cldEditorHtml"]').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            $('#cldEditorTabs a[href="#cldEditorJs"]').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            $('#cldEditorTabs a[href="#cldEditorCss"]').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

            //Initialize Editor tab event listeners
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                //e.target // activated tab
                //e.relatedTarget // previous tab
                switch (e.target.innerHTML) {
                    case "CSS" : CloudIde.cm.css.refresh();break;
                    case "JavaScript" : CloudIde.cm.js.refresh();break;
                    case "HTML" : CloudIde.cm.html.refresh();
                }
            });

            //Initialize status bar segment
            var cldTextAreaHtml = document.getElementById('cldEditorHtmlTextArea');
            var cldTextAreaJs = document.getElementById('cldEditorJsTextArea');
            var cldTextAreaCss = document.getElementById('cldEditorCssTextArea');
            CloudIde.cm.css = CodeMirror.fromTextArea(cldTextAreaCss, CloudIde.getCodeMirrorDefaultConfig("css"));
            CloudIde.cm.js = CodeMirror.fromTextArea(cldTextAreaJs, CloudIde.getCodeMirrorDefaultConfig("javascript"));
            CloudIde.cm.html = CodeMirror.fromTextArea(cldTextAreaHtml, CloudIde.getCodeMirrorDefaultConfig("html"));
            //Initialize settings
            if (_cldEditor.mode !== "debug") {
                //saveSettings();
            }
            //Load add-ons
            //TODO load it dynamically
            //CloudIde.loadAllCodeMirrorAddons();



            //finally, load projects
            CloudIde.editor.loadProjectsToExplorer();
            //release global
        },
        save: function() {
            CloudIde.save();
        },
        preview: function() {
            alert("Hasn't been implemented yet!");
        },
        //Exposes the project handler
        getProjectHandler: function() {
            return CloudIde.projectHandler;
        },
        editorActions : function(actionName,args) {
            CloudIde.editor[actionName](args);
        },
        cldDebug : function() {
            return CloudIde;
        }
    };
}());

// load google feed scripts - should be done in the beginning
//google.load("feeds", "1");

$(document).ready(function() {
    //TODO move 'settings' to private (CloudIde) object
//    //When this val is set to true, the app will skip authentication for the update endpoints
//    if(window.location.origin == "http://localhost:8080") { //TODO replace with GET param
//        _cldEditor.mode = "debug";
//    }
//    else {
//        _cldEditor.mode = "";
//    }
    try {
        _cldEditor.init(window.settings);
    }
    catch (err) {
        console.log(err.stack);
    }
});
