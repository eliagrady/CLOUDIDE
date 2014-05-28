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
        /**
         * Debugger methods for console output (console can be any object with the .log function)
         */
        debugger : {
            listProjects : function(console) {
                var settings = CloudIde.getSettings();
                var length = settings.projects.length;
                console.log("=================");
                console.log(length+ " projects listed:");
                for(var i = 0 ; i < length ; i++){
                    console.log('Item', settings.projects[i]);
                }
                console.log("=================");
            }
        },
        //here we will add callbacks to update the status bar if necessary
        projectHandler : {
            nextId : function() {
                return Math.uuidFast();

//                this.currentId +=1;
//                var id = this.currentId;
//                return id;
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
            getCurrentProject : function() {
                return CloudIde.getSettings().currentProject;
            },
            getCurrentProjectId : function() {
                return CloudIde.getSettings().currentProject.id;
            },
            getProjects : function() {
                return CloudIde.getSettings().projects;
            },
            getProjectById : function(projectId) {
                var settings = CloudIde.getSettings();
                var projects = settings.projects;
                for(var i = 0 ; i < projects.length ; i++) {
                    var project = projects[i];
                    console.log("projectId passed: "+ projectId);
                    console.log("currentlyChecking: "+ project.id);
                    if(project.id == projectId) {
                        return project;
                    }
                }
                return null;
            },
            addProject : function(project) {
                var settings = CloudIde.getSettings();
                //var length = Array.prototype.push.call(settings.projects,project);
                settings.projects.push(project);
                CloudIde.debugger.listProjects(console);
            },
            /**
             * Deletes a given project (can either be the actual object, or it's id)
             * @param project either the actual object, or it's id
             */
            deleteProject : function(project) {
                var settings = CloudIde.getSettings();
                var projects = settings.projects;
                //var length = Array.prototype.push.call(settings.projects,project);
                if(typeof project === "string") {
                    project = this.getProjectById(project);
                    if(project === null) {
                        throw new Error("projectId not found!");
                    }
                }

                var index = settings.projects.indexOf(project);
                if(index > -1) {
                    settings.projects.splice(index,1);
                }
                CloudIde.debugger.listProjects(console);
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
            updateCurrentProject : function() {
                var cp = CloudIde.getSettings().currentProject;
                if(cp === undefined) {
                    throw new Error("Current project is undefined!");
                }
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
            setCurrentProjectById : function(projectId) {
                try {
                    var settings = CloudIde.getSettings();
                    var project = this.getProjectById(projectId);
                    settings.currentProject = project;
                    var cached = CloudIde.cm.cache(projectId);
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
                var selectedProjectSelector = '[selectedProject=true]';
                return $(selectedProjectSelector).text();
            },
            loadProjectsToExplorer : function() {
                var currentlySelectedProjectId = CloudIde.projectHandler.getCurrentProjectId();
                var projects = CloudIde.projectHandler.getProjects();
                //Prepare then UL
                var ul = $('<ul></ul>').addClass("nav").addClass("nav-sidebar").addClass('projects');
                //Case no projects are found
                if(projects.length === 0) {
                    var no_projects = $('<span></span>').text("Project list is empty!").addClass('col-sm-12');
                    var li_noProjects = $('<li></li>').addClass('row-fluid');
                    li_noProjects.append(no_projects);
                    ul.append(li_noProjects);
                }
                //Case there are some projects listed
                else {
                    var project;
                    for(var i = 0 ; i < projects.length ; i++ ) {
                        project = projects[i];
                        var a_projectName_fn = '_cldEditor.editorActions("selectProject","'+project.id+'")';
                        var a_projectDel_fn = '_cldEditor.editorActions("deleteProjectById","'+project.id+'")';
                        var a_projectSettings_fn = '_cldEditor.editorActions("editProjectSettingsById","'+project.id+'")';
                        var a_projectName = $('<a></a>').attr('href','#').attr('onclick',a_projectName_fn).text(project.name).addClass('col-sm-8');
                        var a_projectDel_icon = $('<span></span>').addClass('glyphicon').addClass('glyphicon-remove').addClass('showme');
                        var a_projectDel = $('<a></a>').attr('href','#').attr('onclick',a_projectDel_fn).addClass('col-sm-1').addClass('showhim');
                        a_projectDel.append(a_projectDel_icon);
                        var a_projectSettings_icon = $('<span></span>').addClass('glyphicon').addClass('glyphicon-cog').addClass('showme');
                        var a_projectSettings = $('<a></a>').attr('href','#').attr('onclick',a_projectSettings_fn).addClass('col-sm-1').addClass('showhim');
                        a_projectSettings.append(a_projectSettings_icon);
                        var li;
                        console.log(typeof currentlySelectedProjectId);
                        console.log("currentlySelectedProjectId:"+currentlySelectedProjectId);
                        console.log("compare with: "+project.id);
                        console.log("they are " + ((project.id == currentlySelectedProjectId)?"equal":"different"));


                        if(project.id == currentlySelectedProjectId) {
                            li = $('<li></li>').attr('projectId', project.id).attr('selectedProject', 'true').addClass('row-fluid');
                        }
                        else {
                            li = $('<li></li>').attr('projectId',project.id).attr('selectedProject','false').addClass('row-fluid');
                        }
                        li.append(a_projectName);
                        li.append(a_projectSettings);
                        li.append(a_projectDel);
                        ul.append(li);
                    }
                }
                $('#cldProjectExplorer').find('.projects').remove();
                $('#cldProjectExplorer').append(ul);


                //Mark selected project:
                //Deactivate last 'current project'
                var lastActiveSelector = '[selectedProject=true]';
                var lastActive = $(lastActiveSelector).attr('selectedProject','false').removeClass("active");
                //console.log(lastActive);
                //Activate 'current project'
                var cssSelector = '[projectId='+currentlySelectedProjectId+']';
                var nowActive = $(cssSelector).attr('selectedProject','true').addClass("active");
                //console.log(nowActive);
            },
            selectProject : function(projectId) {
                //Bring to scope:
                CloudIde.projectHandler.setCurrentProjectById(projectId);
                CloudIde.editor.loadProjectsToExplorer();
            },
            deleteProjectById : function(projectId) {
                CloudIde.projectHandler.deleteProject(projectId);
                CloudIde.editor.loadProjectsToExplorer();
            },
            createNewProject : function() {
                var newProject = CloudIde.projectHandler.createNewProjectFromTemplate();
                CloudIde.projectHandler.addProject(newProject);
                if(CloudIde.projectHandler.getProjects().length === 1) {
                    //First project, select it!
                    CloudIde.editor.selectProject(newProject.id);
                }
                else {
                    CloudIde.editor.loadProjectsToExplorer();
                }
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

            //Initialize UUID generator
            var res;
            try {
                var res = $.getScript("../static/lib/Math.uuid.js");
            }
            catch (err) {

            }
            finally {
                //If the UUID script did not load, use fallback:
                //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
                if(!(res && res.status === 200)) {
                    CloudIde.projectHandler.nextId = function() {
                        var d = new Date().getTime();
                        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                            var r = (d + Math.random()*16)%16 | 0;
                            d = Math.floor(d/16);
                            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
                        });
                        return uuid;
                    };
                }
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
        _cldEditor.mode = debugMode;
        debugMode = undefined;
    }
    catch (err) {
        console.log(err.stack);
    }
    window.debug = _cldEditor.cldDebug();
});



