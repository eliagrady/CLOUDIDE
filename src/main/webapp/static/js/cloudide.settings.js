/* cloud ide settings endpoint javascript */

/*jslint browser: true*/
/*global $, jQuery, CodeMirror , appData , appSettings , Wix , console*/


/**
 * Class containing widget property and functions
 * This class is using the module pattern:
 * http://www.yuiblog.com/blog/2007/06/12/module-pattern/
 */
var _cldSettings = (function() {
    "use strict";

    function loadProjects() {
        //Function definitions:
        var selectFunc = function(e) {
            var projectId = e.data.projectId;
            console.log("Select pressed for projectId:"+projectId);
            publishProject(projectId);
            _cldSettings.selectedProjectId = projectId;
            //Wix.Settings.refreshAppByCompIds([compId],queryParams);
            loadProjects();
        };
        var editFunc = function(e) {
            var projectId = e.data.projectId;
            console.log("Edit pressed for projectId:"+projectId);
            var compId;
            var onClose = function() {
                //Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
                console.log("onClose captured");
            };
            if(_cldSettings.mode !== "debug"){
                compId = Wix.Utils.getOrigCompId();
            }
            else {
                compId = "null";  //TODO remove debug mode
            }
            var queryParams = {
                selectedProject : projectId
            };
            //Open editor
            var url;
            if(_cldSettings.mode === "debug") {
                url = 'http://localhost:8080/app/editorstandalone?';
                url += "&instanceId=" +  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                url += "&compId=" + 'null';
                url += "&mode=" + _cldSettings.mode;
                url += "&projectId=" + projectId;
            }
            else {
                url = 'http://wixcloudide.appspot.com/app/editor?';
                url += "instance=" + Utils.getCookie('instance');
                url += "&instanceId=" + Wix.Utils.getInstanceId();
                url += "&compId=" + Wix.Utils.getOrigCompId();
                if(projectId !== null && projectId !== undefined && projectId !== "") {
                    url += "&projectId=" + projectId;
                }
            }

            //var url = 'http://wixcloudide.appspot.com/app/editor' + ?projectId=+projectId;
            console.log("opening editor should be done now");
            //TODO open editor in a quick edit mode (just one project)
            //Wix.openModal(url,window.screen.width*0.8, window.screen.height*0.6,onClose);
            var title = "CloudIde Editor";
            var w = window.screen.width*0.8;
            var h = window.screen.height*0.6;
            if(h < 720) {
                h = 700;
            }
            if(w < 1000) {
                w = 980;
            }
            var windowObjectReference = PopupCenter(url,title,w,h);

            //http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
            function PopupCenter(url, title, w, h) {
                // Fixes dual-screen position                         Most browsers      Firefox
                var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
                var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var left = ((width / 2) - (w / 2)) + dualScreenLeft;
                var top = ((height / 2) - (h / 2)) + dualScreenTop;
                var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

                // Puts focus on the newWindow
                if (window.focus) {
                    newWindow.focus();
                }
                return newWindow;
            }
        };
        console.log("loading projects to explorer...");

        var projects = getProjects();
        if(projects) {
            var currentlySelectedProjectId = projects[0];
        }
        //Prepare main div
        var topDiv = $('<div></div>').addClass('projects').addClass('row-fluid').addClass('fullWidth').addClass('appTop');
        var mainDiv = $('<div></div>').addClass('projects').addClass('row-fluid').addClass('fullWidth').addClass('uilib-footer');


        //Regardless of whether there are or aren't any projects, display the 'CloudIde' MultiProjectEditor link:
        //var openMultiProjectEditorBtnIcon = $('<span></span>').addClass('glyphicon').addClass('glyphicon-3x').addClass('glyphicon-cloud').addClass('appLogo');
        var openMultiProjectEditorBtnText = $('<span></span>').text("Create new projects!").addClass('appLogoText');
        //var openMultiProjectEditorBtnIconContainer = $('<div></div>').addClass('col-xs-10').addClass('col-xs-offset-1');
        var openMultiProjectEditorBtnIconContainer = $('<div></div>').addClass('fullWidth');
        //openMultiProjectEditorBtnIconContainer.append(openMultiProjectEditorBtnIcon);
        var openMultiProjectEditorBtn = $('<div></div>').attr('id','openMultiProjectEditorBtn')
            .addClass('submit').addClass('uilib-btn').addClass('connect').addClass('appCtrl-btn').addClass('col-xs-8').addClass('col-xs-offset-2')
            .click({projectId: null}, editFunc);
        var controlRow = $('<div></div>').addClass('row');
        openMultiProjectEditorBtn.prepend(openMultiProjectEditorBtnText);
        //openMultiProjectEditorBtn.prepend(openMultiProjectEditorBtnIconContainer);
        controlRow.append(openMultiProjectEditorBtn);
        topDiv.append(controlRow);



        //Case no projects are found   //TODO change to display message or, open new editor
        if(!projects || projects.length === 0) {
//            var createNewProjectBtn = $('<div></div>').text("Create new project").attr('id','createNewProjectBtn')
//                .addClass('submit').addClass('btn-large').addClass('uilib-btn').addClass('connect').addClass('appCtrl-btn').addClass('col-xs-8').addClass('col-xs-offset-2')
//                .click({projectId: null}, editFunc);
            var span_no_projects = $('<div></div>').text("Project list is empty!").addClass('col-xs-8').addClass('col-xs-offset-2').addClass("uilib-inline").addClass("uilib-text");
            var noProjectsRow = $('<div></div>').addClass('row');
            noProjectsRow.append(span_no_projects);
            mainDiv.removeClass("box").addClass("uilib-inline").addClass("uilib-text");
            mainDiv.append(noProjectsRow);
            //    <div class="row-fluid">
            // <div id="createNewProjectBtn" class="submit btn-large uilib-btn connect appCtrl-btn col-xs-6 col-xs-offset-3">Create new project</div></div>

        }
        //Case there are some projects listed
        else {
            var project;
            for(var i = 0 ; i < projects.length ; i++ ) {
                project = projects[i];
                //Prepare appContainer
                var appContainer = $('<div></div>').addClass("appContainer").addClass('box').addClass('fullWidth').click({projectId: project.id}, selectFunc);
                console.log("project.id ,_cldSettings.selectedProjectId",project.id,_cldSettings.selectedProjectId,project.id == _cldSettings.selectedProjectId)
                if(project.id == _cldSettings.selectedProjectId) {
                    appContainer.addClass('appContainerSelected');
                }
                // part a: application logo
                var appProjectLogoDiv = $('<div></div>').addClass("appProjectLogo");
                var appProjectLogo = $('<div></div>').addClass("logo");
                var imgSrc = "../static/lib/ui-lib/images/wix_icon.png"; //TODO change to custom image
                var appImg = $('<img/>').addClass("appSettings-padding").attr("width",86).attr("src",imgSrc).attr('alt',"cloudide");
                appProjectLogo.append(appImg);
                appProjectLogoDiv.append(appProjectLogo);
                // part b: application description
                var appInfoDiv = $('<div></div>').addClass("appInfo");
                var prjName = $('<strong></strong>').text(project.name);
                var prjNameDiv = $('<div></div>').addClass("uilib-text").addClass('projectName');
                prjNameDiv.append(prjName);
                //TODO add date formatter
                var prjDescModified = $('<div></div>').html("<strong>Modified: </strong>"+project.modified);
                var prjDescCreated = $('<div></div>').html("<strong>Created: </strong>"+project.created);
                var prjDescDiv = $('<div></div>').addClass("uilib-text").addClass("appDescription");
                prjDescDiv.append(prjNameDiv);
                prjDescDiv.append(prjDescModified);
                prjDescDiv.append(prjDescCreated);
                appInfoDiv.append(prjDescDiv);

                //part c: application control
//                var appCtrlDiv = $('<div></div>').addClass("appCtrl");
//                var appCtrlEdit = $('<div></div>')
//                    .addClass("submit").addClass("uilib-btn").addClass("connect").addClass("appCtrl-btn").addClass('fullWidth')
//                    .click({projectId: project.id}, editFunc);
//                var appCtrlSelect = $('<div></div>')
//                    .addClass("submit").addClass("uilib-btn").addClass("connect").addClass("appCtrl-btn").addClass('fullWidth')
//                    .click({projectId: project.id}, selectFunc);
//                appCtrlEdit.text("Edit");
//                appCtrlSelect.text("Select");
//                //Adds functionality

                var appCtrlDiv = $('<div></div>').addClass("appCtrl");
                var appCtrlEdit = $('<div></div>').addClass("appCtrl-btn").addClass('fullWidth').addClass("paintDarkBlue");
                var appCtrlEdit_icon = $('<span></span>').addClass("glyphicon").addClass("glyphicon-2x").addClass('glyphicon-edit').click({projectId: project.id}, editFunc).addClass("floatRight");
                appCtrlEdit.append(appCtrlEdit_icon);

//                var appCtrlSelect = $('<div></div>').addClass("appCtrl-btn").addClass('fullWidth').addClass("paintGreen");
//                var appCtrlSelect_icon = $('<span></span>').addClass("glyphicon").addClass("glyphicon-1x").addClass('glyphicon-ok').click({projectId: project.id}, selectFunc).addClass("floatRight");
//                appCtrlSelect.append(appCtrlSelect_icon);

                //appCtrlEdit.text("Edit");
                //appCtrlSelect.text("Select");
                //Adds functionality

                appCtrlDiv.append(appCtrlEdit);
                //appCtrlDiv.append(appCtrlSelect);

//                if(project.id == currentlySelectedProjectId) {
//                    li = $('<li></li>').attr('projectId', project.id).attr('selectedProject', 'true').addClass('row-fluid');
//                }
//                else {
//                    li = $('<li></li>').attr('projectId',project.id).attr('selectedProject','false').addClass('row-fluid');
//                }
                appContainer.append(appProjectLogoDiv);
                appContainer.append(appInfoDiv);
                appContainer.append(appCtrlDiv);
                mainDiv.append(appContainer);
            }
        }
        $('#cldProjectExplorer').find('.projects').remove();
        $('#cldProjectExplorer').append(topDiv);
        $('#cldProjectExplorer').append(mainDiv);


        //Mark selected project:
        //Deactivate last 'current project'
        var lastActiveSelector = '[selectedProject=true]';
        var lastActive = $(lastActiveSelector).attr('selectedProject','false').removeClass("active");
        //console.log(lastActive);
        //Activate 'current project'
        if(currentlySelectedProjectId) {
            var cssSelector = '[projectId='+currentlySelectedProjectId.id+']';
            var nowActive = $(cssSelector).attr('selectedProject','true').addClass("active");
            //console.log(nowActive);
        }
    }

    function getSettings() {
        return this.settings;
    }

    function publishProject(projectId) {

        //And finally, update the server with the new settings
        var onSuccess = function() {
            var compId = Wix.Utils.getOrigCompId();
            //OVERRIDER
            var queryParams = {
                projectId : projectId
            };
            Wix.Settings.refreshAppByCompIds([compId],queryParams);
            console.log("updated successfully");
        };
        updateProject(projectId, onSuccess);
    }

    function updateSettings(newSettings, onSuccessCallback) {
        var compId ,instanceId, userId;
        try {
            userId = Wix.Utils.getUid() || "";
            instanceId = Wix.Utils.getInstanceId() || "";
            compId = Wix.Utils.getOrigCompId() || "";
        }
        catch (err) {
            console.log("Not in Wix editor"); //TODO check if in Wix editor
        }

        if(_cldSettings.mode == 'debug') {
            console.log("about to send window.debugMode = " + _cldSettings.mode);
            compId = 'null';
            instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
            userId = Utils.getCookie('instance');
            console.log("set userId to: "+userId);
            console.log("set compId to: "+compId);
        }
        //Saving the appSettings JSON to the server
        $.ajax({
            'type': 'post',
            'url': "/app/save",
            'dataType': "json",
            'contentType': 'application/json; chatset=UTF-8',
            'data': JSON.stringify({
                userId: userId,
                compId: compId,
                settings: newSettings,
                mode: _cldSettings.mode
            }),
            'cache': false,
            'success': onSuccessCallback,
            'error': function (res) {
                if (_cldSettings.mode === "debug") {
                    console.log('error updating data with message ' + res.responseText);
                }
                else {
                    console.log('error updating data with message ' + res.responseText);
                }
            }
        });
    }

    function updateProject(projectId, onSuccessCallback) {
        var compId ,instanceId, userId;
        try {
            userId = Wix.Utils.getUid() || "";
            instanceId = Wix.Utils.getInstanceId() || "";
            compId = Wix.Utils.getOrigCompId() || "";
        }
        catch (err) {
            console.log("Not in Wix editor"); //TODO check if in Wix editor
        }

        if(_cldSettings.mode == 'debug') {
            console.log("about to send window.debugMode = " + _cldSettings.mode);
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
                instanceId: instanceId,
                compId: compId,
                projectId: projectId,
                settings : null,
                project: null,
                mode: _cldSettings.mode
            }),
            'cache': false,
            'success': onSuccessCallback,
            'error': function (res) {
                if (_cldSettings.mode === "debug") {
                    console.log('error publishing project with message ' + res.responseText + 'Status Code: ' +res.statusCode);
                }
                else {
                    console.log('error publishing project with message ' + res.responseText);
                }
            }
        });
    }
    function projectLookup(onSuccessCallback) {
        var compId ,instanceId, userId;
        try {
            userId = Wix.Utils.getUid() || "";
            instanceId = Wix.Utils.getInstanceId() || "";
            compId = Wix.Utils.getOrigCompId() || "";
        }
        catch (err) {
            console.log("Not in Wix editor"); //TODO check if in Wix editor
        }

        if(_cldSettings.mode == 'debug') {
            console.log("about to send window.debugMode = " + _cldSettings.mode);
            compId = 'null';
            instanceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
            userId = Utils.getCookie('instance');
            console.log("set userId to: "+userId);
            console.log("set compId to: "+compId);
        }
        //Saving the appSettings JSON to the server
        $.ajax({
            'type': 'post',
            'url': "/app/projectlookup",
            'dataType': "json",
            'contentType': 'application/json; chatset=UTF-8',
            'data': JSON.stringify({
                userId: userId,
                instanceId: instanceId,
                compId: compId,
                projectId: null,
                settings : null,
                project: null,
                mode: _cldSettings.mode
            }),
            'cache': false,
            'success': onSuccessCallback,
            'error': function (res) {
                if (_cldSettings.mode === "debug") {
                    console.log('error publishing project with message ' + res.responseText + 'Status Code: ' +res.statusCode);
                }
                else {
                    console.log('error publishing project with message ' + res.responseText);
                }
            }
        });
    }

    function getProjects() {
//        console.log("_cldSettings",_cldSettings);
//        console.log("_cldSettings.init.settings",_cldSettings.init.settings);
//        console.log("_cldSettings.settings",_cldSettings.settings);
//        console.log("_cldSettings.settings.appSettings",_cldSettings.settings.appSettings);
//        console.log("_cldSettings.settings.appSettings.projects",_cldSettings.settings.appSettings.projects);
        try {
            return _cldSettings.settings.appSettings.projects;
        }
        catch (err){
            console.log("Fetching projects failed with err:",err);
            return null;
        }
    }

    /**
     * Updating the settings object in the DB by posting an ajax request
     * @param settingsJson
     */
    function fetchSettings(onSuccessCallback) {
        var compId , instanceId , userId;
        try {
            userId = Wix.Utils.getUid() || "";
            instanceId = Wix.Utils.getInstanceId() || "";
            compId = Wix.Utils.getOrigCompId() || "";
        }
        catch (err) {
            console.log("Not in Wix editor"); //TODO check if in Wix editor
        }

        if(_cldSettings.mode == 'debug') {
            console.log("about to send window.debugMode = " + _cldSettings.mode);
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
                mode: _cldSettings.mode
            }),
            'cache': false,
            'success': onSuccessCallback,
            'error': function (res) {
                if (_cldSettings.mode === "debug") {
                    console.log('error updating data with message ' + res.error);

                }
            }
        });
    }

    function bindEdit() {
        $('#cldEditorOpenBtn').click(
            function () {
                var onClose = function() {
                    Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
                    console.log("onClose: app refreshed");
                };
                if(_cldSettings.mode === "debug") {
                    var localUrl = 'http://localhost:8080/app/editorstandalone';
                    Wix.openModal(localUrl,window.screen.width*0.8, window.screen.height*0.6,onClose);
                }
                else {
                    //instanceId = Wix.getInstanceId();
                    //TODO move cookie fetcher from editor to 'common.views.js'
                    var cook = document.cookie.split(';')[0];
                    var fetchedCook = Utils.getCookie('instance');
                    console("cook and fetchedCook are",cook === fetchedCook ? "equal" : "different");
                    window.open('http://wixcloudide.appspot.com/app/editor?instance='+cook);
                    //Wix.openModal(url,window.screen.width*0.8, window.screen.height*0.6,onClose);
                }
            }
        );
    }
    // Public functions
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
        loadSettingsFromServer : function() {
            //Callback to the ajax request
            function useFetchedSettings(res){
                console.log("res is",res);
                var settings = JSON.parse(res.retData);
                _cldSettings.settings = settings;
                console.log("Settings loaded are",_cldSettings.settings);
                //load projects to view

                //Finally, notify: //TODO preloader
                if (_cldSettings.mode === "debug") {
                    console.log("loaded settings from server (debug)");
                }
                else {
                    console.log("loaded settings from server (debug)");
                }
                loadProjects();
            }
            fetchSettings(useFetchedSettings);
        },
        loadSelectedProject: function() {
            //And finally, update the server with the new settings
            var onSuccess = function(res) {
                _cldSettings.selectedProjectId = res.retData;
                console.log("_cldSettings.selectedProjectId selected is",_cldSettings.selectedProjectId);
            };
            projectLookup(onSuccess);
        },
        /**
         * Bind events
         * Listen to changes of the elements
         */
        bindRefresh : function() {
            $('#refreshBtn').click(function() {
                Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
            });
        },
        initWixUI : function() {
            Wix.UI.initialize();

        },
        loadTimeFormatter : function() {
            var url = "../static/lib/date.format.js";
            $.getScript(url);
            console.log("loaded time formatter");

        },
        setMode : function() {
            var mode = Utils.getURLParameter('mode') || "";
            console.log("Mode set to: "+ (mode === 'debug'?mode:"mode not set"));
            _cldSettings.mode = mode;
//            if(_cldSettings.mode !== "debug") {
//                console.log("initPhases is: ",initPhases);
//                initPhases.initWixUI();
//            }
            initPhases.initWixUI();
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
         * http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
         */
        fullscreen : function() {
            var fullScreenApi = {
                    supportsFullScreen: false,
                    isFullScreen: function() { return false; },
                    requestFullScreen: function() {},
                    cancelFullScreen: function() {},
                    fullScreenEventName: '',
                    prefix: ''
                },
                browserPrefixes = 'webkit moz o ms khtml'.split(' ');

            // check for native support
            if (typeof document.cancelFullScreen != 'undefined') {
                fullScreenApi.supportsFullScreen = true;
            }
            else {
                // check for fullscreen support by vendor prefix
                for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
                    fullScreenApi.prefix = browserPrefixes[i];

                    if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                        fullScreenApi.supportsFullScreen = true;

                        break;
                    }
                }
            }

            // update methods to do something useful
            if (fullScreenApi.supportsFullScreen) {
                fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

                fullScreenApi.isFullScreen = function() {
                    switch (this.prefix) {
                        case '':
                            return document.fullScreen;
                        case 'webkit':
                            return document.webkitIsFullScreen;
                        default:
                            return document[this.prefix + 'FullScreen'];
                    }
                };
                fullScreenApi.requestFullScreen = function(el) {
                    return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
                };
                fullScreenApi.cancelFullScreen = function(el) {
                    return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
                };
            }

            // jQuery plugin
            if (typeof jQuery != 'undefined') {
                jQuery.fn.requestFullScreen = function() {

                    return this.each(function() {
                        if (fullScreenApi.supportsFullScreen) {
                            fullScreenApi.requestFullScreen(this);
                        }
                    });
                };
            }

            // export api
            return fullScreenApi;
        }
    };
    return {
        init: function(){
            var startLoading = Date.now();
            var async = initPhases.asyncLoader();

            async.executePhase("setMode",initPhases.setMode);
            async.executePhase("loadSelectedProject",initPhases.loadSelectedProject);
            async.executePhase("loadSettingsFromServer",initPhases.loadSettingsFromServer);
            //async.executePhase("bindEditButton",initPhases.bindRefresh);
            //async.executePhase("loadTimeFormatter",initPhases.loadTimeFormatter);

            var finishLoading = Date.now();
            var totalTime = finishLoading-startLoading;
            console.log("Load complete in "+totalTime+"ms");
        },
        settings : function() {
            getSettings();
        }
    };
}());

// load google feed scripts - should be done in the beginning
//google.load("feeds", "1");

$(document).ready(function() {
    //When this val is set to true, the app will skip authentication for the update endpoints
    try {
        _cldSettings.init();
    }
    catch (err) {
        console.log(err.stack);
    }
});