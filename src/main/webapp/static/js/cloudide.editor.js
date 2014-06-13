/* cloud ide editor javascript */
/*jslint browser: true*/
/*global $, jQuery, CodeMirror , Wix*/

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
                projects : [],
            }
        },
        projectsData : {}, //mapping projectId -> projectCodeObject (JSON)
        //CodeMirror instances
        cm: {
            html : {},
            js : {},
            css : {},
            //TODO consider separating to cache.in and cache.out functions for a cache object
            /**
             * Caches the working Doc objects for faster working module
             * @param projectId the projectId to cache, or to get it's cache
             * @param arr an optional array of objects to cache
             * @return {*} either the cached array of objects, or undefined if it hasn't been cached.
             */
            cache : {
                storage : {
                    //Container
                },
                in : function(identifier,object) {
                    CloudIde.cm.cache.storage['"'+identifier+'"'] = object;
                },
                out : function(identifier) {
                    return CloudIde.cm.cache.storage['"'+identifier+'"'];
                },
                getStorage : function() {
                    return CloudIde.cm.cache.storage;
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
                if(console === undefined) {
                    console = window.console;
                }
                console.log("=================");
                console.log(length+ " projects listed:");
                for(var i = 0 ; i < length ; i++){
                    console.log('Item', settings.projects[i]);
                }
                console.log("=================");
            },
            displayCache : function(console) {
                var cacheStorage = CloudIde.cm.cache.getStorage();
                if(console === undefined) {
                    console = window.console;
                }
                console.log("=================");
                console.log("projects cached:");
                for(var cached in cacheStorage){
                    console.log(cached,cacheStorage[cached]);
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
                name : "New project",
                created : new Date(),
                modified : new Date()
            },
            projectDataTemplate : {
                html : "",
                js : "",
                css : ""
            },
            getCurrentProject : function() {
                return CloudIde.getSettings().currentProject;
            },
            getCurrentProjectId : function() {
                try {
                    return CloudIde.getSettings().currentProject.id;
                }
                catch (err) {
                    console.log("Failed getting currentProjectId with err:",err.stack);
                    return null;
                }
            },
            getProjects : function() {
                return CloudIde.getSettings().projects;
            },
            getProjectById : function(projectId) {
                //return CloudIde.getProject().projects[projectId];
                var settings = CloudIde.getSettings();
                var projects = settings.projects;
                for(var i = 0 ; i < projects.length ; i++) {
                    var project = projects[i];
                    console.log("projectId passed: "+ projectId);
                    console.log("currentlyChecking: "+ project.id);
                    if(project.id == projectId) {
                        CloudIde.projectHandler.assertData(projectId);
                        return project;
                    }
                }
                return null;
            },
            addProject : function(project) {
                var settings = CloudIde.getSettings();
                //var length = Array.prototype.push.call(settings.projects,project);
                var fetchedProject = CloudIde.projectHandler.getProjectById(project.id);
                if(fetchedProject !== null) {
                    //If fetched project is not null, it means we don't have to add it: it's already there, let's update it:
                    CloudIde.projectHandler.updateCurrentProject();
                }
                else {
                    settings.projects.push(project);
                }
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
            /**
             * Edit the configuration of a project based on a given projectSettings object
             * @param projectId the project to edit
             * @param projectSettings the new project settings (ex: {name: "some new name", modified : new Date() } )
             */
            editProject : function(projectId,projectSettings) {
                var project = CloudIde.projectHandler.getProjectById(projectId);
                project.name = projectSettings.name;
                project.modified = new Date();
            },
            createNewProjectFromTemplate : function() {
//                //Save current project before creating a new one
//                try {
//                    CloudIde.projectHandler.addCurrentProjectToProjectsArray();
//                }
//                catch (err) {
//                    console.log("unable to add current project. current project is:"+CloudIde.getProject().currentProject);
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
                var newProject = Utils.clone(CloudIde.projectHandler.projectTemplate);
                var newProjectData = Utils.clone(CloudIde.projectHandler.projectDataTemplate);
                //var newProject = clone(CloudIde.projectHandler.projectTemplate);
                //Change ID:
                var nextId = CloudIde.projectHandler.nextId();
                newProject.id = nextId;
                newProject.created = new Date();
                return newProject;
            },
            createNewProjectDataFromTemplate : function() {
                return Utils.clone(CloudIde.projectHandler.projectDataTemplate);
            },
            addCurrentProjectToProjectsArray : function() {
                CloudIde.projectHandler.addProject(CloudIde.getSettings().currentProject);
            },
            /**
             * Assert that the given projectId had it's data loaded from the server
             * @param projectId the given projectId to assert
             */
            assertData : function(projectId) {
                //Lazy fetching projects from server
                if(CloudIde.projectsData[projectId] == undefined) {
                    //Project data wasn't loaded before, load it:
                    CloudIde.fetchProjectData(projectId);
                }
            },
            updateCurrentProject : function() {
//                var htmlCode = project.code.html;
//                var jsCode = project.code.js;
//                var cssCode = project.code.css;
                var htmlCode = CloudIde.cm.html.getDoc().getValue();
                var jsCode = CloudIde.cm.js.getDoc().getValue();
                var cssCode = CloudIde.cm.css.getDoc().getValue();
                //Encoding
                htmlCode =  encodeURI($.base64.encode(htmlCode));
                jsCode =  encodeURI($.base64.encode(jsCode));
                cssCode =  encodeURI($.base64.encode(cssCode));

                //setup current project
                var settings = CloudIde.getSettings();
                settings.currentProject.name = CloudIde.editor.getCurrentProjectName();
                settings.currentProject.modified = new Date();
                CloudIde.projectsData[settings.currentProject.id].code.html = htmlCode;
                CloudIde.projectsData[settings.currentProject.id].code.js = jsCode;
                CloudIde.projectsData[settings.currentProject.id].code.css = cssCode;
                console.log("validation, settings.currentProject: ", settings.currentProject);
                console.log("validation, CloudIde.getSettings.currentProject: ", CloudIde.getSettings.currentProject);
            },
            //TODO check if method necessary
            updateProjectById : function(projectId) {
                var projectCache = CloudIde.cm.cache.out(projectId);
//                var htmlCode = project.code.html;
//                var jsCode = project.code.js;
//                var cssCode = project.code.css;
                var htmlCode = CloudIde.cm.html.getDoc().getValue();
                var jsCode = CloudIde.cm.js.getDoc().getValue();
                var cssCode = CloudIde.cm.css.getDoc().getValue();
                //Encoding
                htmlCode =  encodeURI($.base64.encode(htmlCode));
                jsCode =  encodeURI($.base64.encode(jsCode));
                cssCode =  encodeURI($.base64.encode(cssCode));

                //setup current project
                var settings = CloudIde.getSettings();
                settings.currentProject.name = CloudIde.editor.getCurrentProjectName();
                settings.currentProject.modified = new Date();
                settings.currentProject.code.html = htmlCode;
                settings.currentProject.code.js = jsCode;
                settings.currentProject.code.css = cssCode;
                var compId,instanceId;
                if(_cldEditor.mode === "debug") {
                    compId = "null";
                    instanceId = Utils.getCookie('instance');
                }
                else {
                    try {
                        compId = Wix.Utils.getOrigCompId();
                        instanceId = Wix.Utils.getInstanceId();
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                settings.currentProject.compId = compId;
                settings.currentProject.instanceId = instanceId;
                console.log("validation, settings.currentProject: ", settings.currentProject);
                console.log("validation, CloudIde.getSettings.currentProject: ", CloudIde.getSettings.currentProject);
            },
            /**
             * Sets the current project, by it's given id.
             * It assumes the existence of the project, in the projects array
             * @param projectId the id of the project to set as current project
             */
            setCurrentProjectById : function(projectId) {
                console.log("Attempting to bring project ",projectId, " to scope");
                //Validate that the project isn't in scope first:
                var currentlySelectedProjectId = CloudIde.projectHandler.getCurrentProjectId();
                //Case selecting the current project
                if(projectId === currentlySelectedProjectId) {
                    console.log("Currently selected project is the same as target. Aborting request.");
                    console.log("Current project is:",CloudIde.projectHandler.getCurrentProject());
                    CloudIde.projectHandler.swapDocs(projectId);
                    return;
                }
                //Case selecting any other project
                try {
                    var newProjectToSet = CloudIde.projectHandler.getProjectById(projectId);
                    if(newProjectToSet === null) {
                        throw new Error("Failed setting project. reason: unknown projectId: "+projectId);
                    }
                    console.log("project found in projects array: ",newProjectToSet);
                    //Try fetching the new project CodeMirrorDoc from cache:
                    var cache = CloudIde.cm.cache.out(projectId);
                    CloudIde.projectHandler.swapDocs(projectId,cache);
                    CloudIde.getSettings().currentProject = newProjectToSet;
                }
                catch (err) {
                    console.log(err.stack);
                }
            },
            swapDocs : function(projectId, cache) {
                /*
                 cache logic : lookup the current project, and push it's Docs to the cache using the id of the project.
                 now, in order to bring up a new project to the viewer, first lookup in the cache object given (if
                 it was previously loaded. On cache hit, bring it from the cache. on cache miss, create a new Doc.
                 Once this project is swapped out, it will be cached so it can be loaded quickly later.
                 */


                var newHtmlDoc, newJsDoc, newCssDoc; //CodeMirror Doc objects
                var newHtmlCode, newJsCode, newCssCode; //Code text
                var oldHtmlDoc, oldJsDoc, oldCssDoc; //Current project (old) Doc objects
                var oldHtmlCode, oldJsCode, oldCssCode; //Current project (old) Code text
                var validCurrentProject = false;
                var oldCurrentProjectId;
                var settings = CloudIde.getSettings();
                try {
                    oldCurrentProjectId = settings.currentProject.id;

//                    oldHtmlCode = settings.currentProject.code.html;
//                    oldJsCode = settings.currentProject.code.js;
//                    oldCssCode = settings.currentProject.code.css;
//
//                    oldHtmlDoc = CloudIde.cm.html.getDoc();
//                    oldJsDoc = CloudIde.cm.js.getDoc();
//                    oldCssDoc = CloudIde.cm.css.getDoc();

                    validCurrentProject = true;
                    console.log("valid current project before swap:",CloudIde.projectHandler.getCurrentProject());
                }
                catch (err) {
//                    //No 'current project' set, fetch it from the project array, and try again:
//                    newHtmlCode = CloudIde.getProject().currentProject.code.html;
//                    newJsCode = CloudIde.getProject().currentProject.code.js;
//                    newCssCode = CloudIde.getProject().currentProject.code.css;
                }
                //Cache object is present and valid
                if(cache && cache.length > 2) {
                    newHtmlDoc = cache[0];
                    newJsDoc = cache[1];
                    newCssDoc = cache[2];
                    console.log("Loaded from cache");
                }
                //Cache object not present, generate new CodeMirror Docs from current project's code
                else {
                    var newProjectToSet = CloudIde.projectHandler.getProjectById(projectId);
                    console.log("CloudIde.projectsData[newProjectToSet.id]",CloudIde.projectsData[newProjectToSet.id]);
                    newHtmlDoc = CodeMirror.Doc($.base64.decode(CloudIde.projectsData[newProjectToSet.id].code.html),"htmlmixed");
                    newJsDoc = CodeMirror.Doc($.base64.decode(CloudIde.projectsData[newProjectToSet.id].code.js),"javascript");
                    newCssDoc = CodeMirror.Doc($.base64.decode(CloudIde.projectsData[newProjectToSet.id].code.css),"css");
                    CloudIde.cm.cache.in(newProjectToSet.id,[newHtmlDoc,newJsDoc,newCssDoc]);
                    console.log("Created new cache entry");
                }
                oldHtmlDoc = CloudIde.cm.html.swapDoc(newHtmlDoc);
                oldJsDoc = CloudIde.cm.js.swapDoc(newJsDoc);
                oldCssDoc = CloudIde.cm.css.swapDoc(newCssDoc);
                if(validCurrentProject) { //If the current project is valid, cache it.
                    //CloudIde.cm.cache(oldCurrentProjectId,[oldHtmlDoc,oldJsDoc,oldCssDoc]);
                }
                CloudIde.debugger.displayCache(console);
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
                var character = "F11";
                jQuery.event.trigger({ type : 'keypress', which : character.charCodeAt(0) });
            },
            getCurrentProjectName : function() {
                var selectedProjectSelector = '[selectedProject=true]';
                var projectName = $(selectedProjectSelector).text();
                if(projectName === '') {
                    projectName = CloudIde.getSettings().currentProject.name;
                }
                return projectName;
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
                        var a_projectSettings = $('<a></a>').attr('href','#').attr('func',a_projectSettings_fn).addClass('col-sm-1').addClass('showhim');
                        a_projectSettings.attr('data-toggle','modal').attr('data-target','#projectSettingsModal');
                        a_projectSettings.append(a_projectSettings_icon);
                        var li;
//                        console.log(typeof currentlySelectedProjectId);
//                        console.log("currentlySelectedProjectId:"+currentlySelectedProjectId);
//                        console.log("compare with: "+project.id);
//                        console.log("they are " + ((project.id == currentlySelectedProjectId)?"equal":"different"));


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


                //Mark selected project, project Explorer:
                //Deactivate last 'current project'
                var lastActiveSelector = '[selectedProject=true]';
                var lastActive = $(lastActiveSelector).attr('selectedProject','false').removeClass("active");
                //console.log(lastActive);
                //Activate 'current project'
                var cssSelector = '[projectId='+currentlySelectedProjectId+']';
                var nowActive = $(cssSelector).attr('selectedProject','true').addClass("active");

                $('#cldProjectName').text(CloudIde.editor.getCurrentProjectName());

                //console.log(nowActive);
            },
            /**
             * Selects a given project using it's projectId to be the current project, and loads up it's code.
             * It also asserts that the project data is available.
             * Finally it updates the project explorer accordingly.
             * @param projectId the id of the project to select
             */
            selectProject : function(projectId) {
                //Bring to scope:
                CloudIde.projectHandler.assertData(projectId);
                CloudIde.projectHandler.setCurrentProjectById(projectId);
                CloudIde.editor.loadProjectsToExplorer();
            },
            updateStatusBar: function (text, timeout, callback) {
                $('#cldStatusbar').text(text);
                //console.log("Text, Timeout and callback are: ", text ,timeout ,callback);
                if (timeout !== undefined) {
                    //clears the status bar
                    setTimeout(function() {
                        CloudIde.editor.updateStatusBar("Idle", undefined, undefined);
                    }, timeout);
                }
                if(typeof callback === 'function') {
                    return callback();//TODO check for security and necessity of this op
                }
            },
            deleteProjectById : function(projectId) {
                CloudIde.projectHandler.deleteProject(projectId);
                CloudIde.editor.loadProjectsToExplorer();
            },
            /**
             * Creates a new project from template.
             * If the project is the first one, it also selects it.
             */
            createNewProject : function() {
                var newProject = CloudIde.projectHandler.createNewProjectFromTemplate();
                var newProjectData = CloudIde.projectHandler.createNewProjectDataFromTemplate();
                CloudIde.projectHandler.addProject(newProject);
                CloudIde.projectsData[newProject.id] = newProjectData;
                if(CloudIde.projectHandler.getProjects().length === 1) {
                    //First project, set it to be the current project, then select it!
                    CloudIde.projectHandler.setCurrentProjectById(newProject.id);
                    CloudIde.editor.selectProject(newProject.id);
                }
                else {
                    CloudIde.editor.loadProjectsToExplorer();
                }
            },
            /**
             * Edits a project's settings
             * @param options a JSON notation object for the new project's settings
             */
            editProjectSettingsById : function(options) {
                console.log("options object is:",options);
                var projectId = options.projectId;
                var newName = options.name;
                var cssSelector = '[projectid="'+projectId+'"] > a';
                var oldName = $(cssSelector).get(0).innerText;
                //Sets the new name visually:
                $(cssSelector).get(0).innerText = newName;
                //Sets the new name programmatically
                CloudIde.projectHandler.editProject(projectId,options);

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
                        "Ctrl-Space": "autocomplete",
                        "F11": function(cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function(cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
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
                        "Ctrl-Space": "autocomplete",
                        "F11": function(cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function(cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
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
                        "Ctrl-Space": "autocomplete",
                        "F11": function(cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function(cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
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
        /**
         * Saves the current project
         */
        save: function () {
            //Update the current project (active project)
            CloudIde.projectHandler.updateCurrentProject();
            CloudIde.projectHandler.addCurrentProjectToProjectsArray();
            var projectId = CloudIde.projectHandler.getCurrentProjectId();


            var compId ,instanceId, userId;
            try {
                userId = Wix.Utils.getUid() || "";
                instanceId = Wix.Utils.getInstanceId() || "";
                compId = Wix.Utils.getOrigCompId() || "";
            }
            catch (err) {
                console.log("Not in Wix editor"); //TODO check if in Wix editor
            }

            if(_cldEditor.mode == 'debug') {
                console.log("about to send window.debugMode = " + _cldEditor.mode);
                compId = 'null';
                instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                userId = Utils.getCookie('instance');
                console.log("set userId to: "+userId);
                console.log("set compId to: "+compId);
                var data = JSON.stringify({
                    userId: userId,
                    instanceId: instanceId,
                    compId: compId,
                    projectId: projectId,
                    settings : CloudIde.settings,
                    project: CloudIde.projectsData[projectId],
                    mode: _cldEditor.mode
                });
                console.log("about to send data:",data);
            }
            //Saving the appSettings JSON to the server
            $.ajax({
                'type': 'post',
                'url': "/app/save",
                'dataType': "json",
                'contentType': 'application/json; chatset=UTF-8',
                'data': JSON.stringify({
                    userId: userId,
                    instanceId: instanceId,
                    compId: compId,
                    projectId: projectId,
                    settings : CloudIde.settings,
                    project: {
                        projectId : projectId,
                        code : CloudIde.projectsData[projectId]
                    },
                    mode: _cldEditor.mode
                }),
                'cache': false,
                'success': function (res) {
                    console.log("save completed");
                    if (_cldEditor.mode === "debug") {
                        CloudIde.editor.updateStatusBar("Saved successfully", 5000, undefined);
                    }
                    else {
                        CloudIde.editor.updateStatusBar("Saved successfully", 5000, undefined);
                        Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
                    }
                },
                'error': function (res) {
                    if (_cldEditor.mode === "debug") {
                        console.log('error updating data with message ' + res.responseText);
                    }
                }
            });
        },
        publishProject: function () { //TODO decide on keeping this ability
            //Update the current project (active project)
            CloudIde.projectHandler.updateCurrentProject();
            CloudIde.projectHandler.addCurrentProjectToProjectsArray();


            var compId ,instanceId, userId;
            try {
                userId = Wix.Utils.getUid() || "";
                instanceId = Wix.Utils.getInstanceId() || "";
                compId = Wix.Utils.getOrigCompId() || "";
            }
            catch (err) {
                console.log("Not in Wix editor"); //TODO check if in Wix editor
            }

            if(_cldEditor.mode == 'debug') {
                console.log("about to send window.debugMode = " + _cldEditor.mode);
                compId = 'null';
                instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                userId = Utils.getCookie('instance');
                console.log("set userId to: "+userId);
                console.log("set compId to: "+compId);
            }
            //Saving the appSettings JSON to the server
            $.ajax({
                'type': 'post',
                'url': "/app/publish",
                'dataType': "json",
                'contentType': 'application/json; chatset=UTF-8',
                'data': JSON.stringify({
                    userId: userId,
                    compId: compId,
                    settings: CloudIde.settings,
                    mode: _cldEditor.mode
                }),
                'cache': false,
                'success': function (res) {
                    console.log("save completed");
                    if (_cldEditor.mode === "debug") {
                        CloudIde.editor.updateStatusBar("Saved successfully", 5000, undefined);
                    }
                    else {
                        CloudIde.editor.updateStatusBar("Saved successfully", 5000, undefined);
                        Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
                    }
                },
                'error': function (res) {
                    if (_cldEditor.mode === "debug") {
                        console.log('error updating data with message ' + res.responseText);
                    }
                }
            });
        },
        fetchSettings: function (callback) {
            var compId , instanceId , userId;
            try {
                userId = Wix.Utils.getUid() || "";
                instanceId = Wix.Utils.getInstanceId() || "";
                compId = Wix.Utils.getOrigCompId() || "";
            }
            catch (err) {
                console.log("Not in Wix editor"); //TODO check if in Wix editor
            }

            if(_cldEditor.mode === 'debug') {
                console.log("about to send window.debugMode = " + _cldEditor.mode);
                compId = 'null';
                instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                userId = Utils.getCookie('instance');
                console.log("set userId to: "+userId);
                console.log("set compId to: "+compId);
            }
            //Loading the appSettings JSON from the server
            $.ajax({
                'type': 'post',
                'url': "/app/loadsettings",
                'dataType': "json",
                'timeout' : 5000,
                'contentType': 'application/json; chatset=UTF-8',
                'data': JSON.stringify({
                    userId: userId,
                    settings: {},
                    mode: _cldEditor.mode
                }),
                'cache': false,
                'success': callback,
                'error': callback
//                function (res) {
//                    if (_cldEditor.mode === "debug") {
//                        console.log('error fetching settings' , res);
//                        return callback(res);
//                    }
//                }
            });
        },
        fetchProjectData: function (projectId) {
            var compId , instanceId , userId;
            try {
                userId = Wix.Utils.getUid() || "";
                instanceId = Wix.Utils.getInstanceId() || "";
                compId = Wix.Utils.getOrigCompId() || "";
            }
            catch (err) {
                console.log("Not in Wix editor"); //TODO check if in Wix editor
            }

            if(_cldEditor.mode === 'debug') {
                console.log("about to send window.debugMode = " + _cldEditor.mode);
                compId = 'null';
                instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                userId = Utils.getCookie('instance');
                console.log("set userId to: "+userId);
                console.log("set compId to: "+compId);
            }
            //Loading the project code (JSON) from the server
            $.ajax({
                'type': 'post',
                'url': "/app/loadproject",
                'async' : false,
                'dataType': "json",
                'timeout' : 5000,
                'contentType': 'application/json; chatset=UTF-8',
                'data': JSON.stringify({
                    userId: userId,
                    instanceId: instanceId,
                    compId: compId,
                    projectId: projectId,
                    settings: null,
                    project: null,
                    mode: _cldEditor.mode
                }),
                'cache': false,
                'success': function(res) {
                    console.log("res is", res);
                    var ret = JSON.parse(res.retData);
                    console.log("ret.projectId", ret.projectId);
                    console.log("ret.code", ret.code);
                    CloudIde.projectsData[ret.projectId] = ret.code;
                },
                'error': function (res) {
                    if (_cldEditor.mode === "debug") {
                        console.log('error fetching project data with result ' , res);
                    }
                    return res;
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
    var Utils = {
        getCookie : function(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length,c.length);
                }
            }
            return "";
        },
        getURLParameter : function(sParam) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) {
                    return sParameterName[1];
                }
            }
        },
        /**
         * This function clones a given object and returns it's cloned instance
         * @param object the object to clone
         * @returns a cloned instance of the given object
         */
        clone : function(object) {
            var newInstance = JSON.parse(JSON.stringify(object));
            return newInstance;
        }

    };
    var initPhases = {
        asyncLoader : function() {
            var queue = [], paused = false;
            this.executePhase = function(phaseDescription, phase) {
                queue.push(function() {
                    console.log(phaseDescription);
                    phase();
                });
                runPhase(this);
            };
            this.pause = function() {
                paused = true;
            };
            this.resume = function() {
                paused = false;
                setTimeout(runPhase, 1);
            };
            function runPhase(loader) {
                if (!paused && queue.length) {
                    queue.shift()();
                    if (!paused) {
                        loader.resume();
                    }
                }
            }
            return this;
        },
        loadModalsPhase : function() {
            //Define a helper function for inserting a string
            String.prototype.insert = function (index, string) {
                if (index > 0)
                    return this.substring(0, index) + string + this.substring(index, this.length);
                else
                    return string + this;
            };
            //On run, this will fire:
            $('#projectSettingsModal').on('shown.bs.modal', function (e) {
                // Bind Save button
                var captured = e.relatedTarget;
                console.log("captured shown:",captured);
                var func = $(captured).attr('func');
                //Function looks like this:
                console.log("function is",func, "and it's type: ",typeof func);
                console.log("$('#projectSettingsSaveBtt') is:",$('#projectSettingsSaveBtt'));
                var currentlyEditedProjectName = $(captured).prev().text();
                var newName;
                console.log("currentlyEditedProjectName:",currentlyEditedProjectName);
                $('#projectSettingsNameInputField').attr('placeholder',currentlyEditedProjectName);
                $('#projectSettingsSaveBtt').get(0).onclick = function() {
                    //_cldEditor.editorActions("editProjectSettingsById","b8d19db7-a153-415f-bf7c-b21ef50f224a")
                    //We're going to add another parameter (3rd parameter) as the optional 'options' parameter
                    //TODO input validation
                    newName = $('#projectSettingsNameInputField').val() || currentlyEditedProjectName; //Failsafe, keep original name
                    console.log("func is:",func);
                    //Hack to convert the 'args' to an argument object //TODO change the way args are passed and constructed!
                    func = func.insert(51,"{projectId:");
//                    for(var i=0 ; i < func.length ; i++ ) {
//                        console.log(i,func.insert(i,"INJECTION"));
//                    }
                    func = func.insert(func.length-1,', name: "'+newName+'"}');
                    //Now, function looks like this:
                    console.log("now, function is",func, "and it's type: ",typeof func);
                    setTimeout(func,0);
                    $('#projectSettingsModal').modal('hide');
                    $('#projectSettingsNameInputField').val("");

                };
            });
            $('#projectSettingsModal').on('hidden.bs.modal', function (e) {
                // Unbind Save button
                var captured = e.relatedTarget;
                console.log("captured removed:",captured);
            });
        },
        loadCodeMirrorToTextAreasPhase : function() {
            var cldTextAreaHtml = document.getElementById('cldEditorHtmlTextArea');
            var cldTextAreaJs = document.getElementById('cldEditorJsTextArea');
            var cldTextAreaCss = document.getElementById('cldEditorCssTextArea');
            CloudIde.cm.css = CodeMirror.fromTextArea(cldTextAreaCss, CloudIde.getCodeMirrorDefaultConfig("css"));
            CloudIde.cm.js = CodeMirror.fromTextArea(cldTextAreaJs, CloudIde.getCodeMirrorDefaultConfig("javascript"));
            CloudIde.cm.html = CodeMirror.fromTextArea(cldTextAreaHtml, CloudIde.getCodeMirrorDefaultConfig("html"));
            //Set height:
            var innerHeight = window.innerHeight;
            var headerHeight = 50;
            var footerHeight = 20;
            var tabsHeight = 42;
            //42:  Answer to the Ultimate Question of Life, The Universe, and Everything
            var newHeight = innerHeight - headerHeight - footerHeight - tabsHeight - 42;

            CloudIde.cm.html.setSize(null,newHeight);
            CloudIde.cm.js.setSize(null,newHeight);
            CloudIde.cm.css.setSize(null,newHeight);
        },
        bindCodeMirrorTabs : function() {
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
        },
        setMode : function() {
            var mode = Utils.getURLParameter('mode') || "";
            console.log("Mode set to: "+ (mode === 'debug'?mode:"mode not set"));
            _cldEditor.mode = mode;
        },
        bindCodeMirrorTabsListeners : function() {
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

        },
        initIdGenerator : function() {
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
        },
        loadSettingsFromServer : function() {
            //Callback to the ajax request
            function useFetchedSettings(res){
                if(res.retData) {
                    CloudIde.settings = JSON.parse(res.retData);
                    var projId = Utils.getURLParameter('projectId');
                    if(!projId) {
                        projId = CloudIde.projectHandler.getCurrentProjectId();
                        CloudIde.fetchProjectData(projId);
                    }
//                    //Fetch the projectData from DB, and then set it to the projectC
//                    var projectData = CloudIde.fetchProjectData(projId);
//                    CloudIde.projectsData[projId] = projectData;

                    //load projects to explorer
                    //CloudIde.editor.loadProjectsToExplorer();
                    CloudIde.editor.selectProject(projId);
                }
                else {//No settings loaded, init a new editor instance
                    //Initialize template project if the fetched settings aren't proper
                    CloudIde.editor.createNewProject();
                }

                //Finally, notify:
                if (_cldEditor.mode === "debug") {
                    console.log("loaded settings from server (debug)");
                    CloudIde.editor.updateStatusBar("Loaded settings successfully", 5000, undefined);
                }
                else {
                    CloudIde.editor.updateStatusBar("Loaded settings successfully", 5000, undefined);
                }
            }
            CloudIde.fetchSettings(useFetchedSettings);
        }
    };
    // Public functions
    return {
        init: function() {
            var startLoading = Date.now();
            var async = initPhases.asyncLoader();
            async.executePhase("setMode",initPhases.setMode);
            initPhases.loadCodeMirrorToTextAreasPhase();
            async.executePhase("loadSettingsFromServer",initPhases.loadSettingsFromServer);
            async.executePhase("bindCodeMirrorTabs",initPhases.bindCodeMirrorTabs);
            async.executePhase("bindCodeMirrorTabsListeners",initPhases.bindCodeMirrorTabsListeners);
            async.executePhase("loadModalsPhase",initPhases.loadModalsPhase);
            async.executePhase("initIdGenerator",initPhases.initIdGenerator);
            //Initialize menu segment
            //Initialize project explorer segment
            //Initialize status bar segment
            //Initialize settings
            //release global
            //TODO preloader
            //Load add-ons
            //CloudIde.loadAllCodeMirrorAddons();
            var finishLoading = Date.now();
            var totalTime = finishLoading-startLoading;
            console.log("Load complete in "+totalTime+"ms");
        },
        save: function() {
            CloudIde.save();
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
        _cldEditor.init();
    }
    catch (err) {
        console.log(err.stack);
    }
    //TODO remove from production code, for debugging only!
    window.debug = _cldEditor.cldDebug();
});


