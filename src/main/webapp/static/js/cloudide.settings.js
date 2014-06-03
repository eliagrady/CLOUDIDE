/* cloud ide settings endpoint javascript */

/*jslint browser: true*/
/*global $, jQuery, CodeMirror , appData , appSettings , Wix*/


/**
 * Class containing widget property and functions
 */
var _cldSettings = (function() {
    "use strict";

    function loadProjects() {
        console.log("loading projects to explorer...");
        var projects = getProjects();
        var currentlySelectedProjectId = projects[0];
        //Prepare main div
        var mainDiv = $('<div></div>').addClass("appContainer").addClass("box").addClass('projects');
        //Case no projects are found
        if(projects.length === 0) {
            var no_projects = $('<div></div>').text("Project list is empty!").addClass('col-sm-12');
            var div_noProjects = $('<div></div>').addClass('row-fluid');
            div_noProjects.append(no_projects);
            mainDiv.removeClass("box").addClass("uilib-inline").addClass("uilib-text");
            mainDiv.append(div_noProjects);
        }
        //Case there are some projects listed
        else {
            var project;

            //Function definitions:
            var selectFunc = function(e) {
                var projectId = e.data.projectId;
                console.log("Select pressed for projectId:"+projectId);
                var compId;
                if(_cldSettings.mode !== "debug"){
                    compId = Wix.Utils.getOrigCompId();
                }
                else {
                    compId = "null";  //TODO remove debug mode
                }
                var queryParams = {
                    selectedProject : projectId
                };
                Wix.Settings.refreshAppByCompIds([compId],queryParams);
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
                var url = 'http://wixcloudide.appspot.com/app/editor';
                Wix.openModal(url,window.screen.width*0.8, window.screen.height*0.6,onClose);
            };

            for(var i = 0 ; i < projects.length ; i++ ) {
                project = projects[i];
                // part a: application logo
                var appLogoDiv = $('<div></div>').addClass("appLogo");
                var appLogo = $('<div></div>').addClass("logo");
                var imgSrc = "../static/lib/ui-lib/images/wix_icon.png"; //TODO change to custom image
                var appImg = $('<img/>').addClass("appSettings-padding").attr("width",86).attr("src",imgSrc).attr('alt',"cloudide");
                appLogo.append(appImg);
                appLogoDiv.append(appLogo);
                // part b: application description
                var appInfoDiv = $('<div></div>').addClass("appInfo");
                var prjName = $('<strong></strong>').text(project.name);
                var prjNameDiv = $('<div></div>').addClass("uilib-text");
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
                var appCtrlDiv = $('<div></div>').addClass("appCtrl");
                var appCtrlEdit = $('<div></div>')
                    .addClass("submit").addClass("uilib-btn").addClass("connect").addClass("appCtrl-btn")
                    .click({projectId: project.id}, selectFunc);
                var appCtrlSelect = $('<div></div>')
                    .addClass("submit").addClass("uilib-btn").addClass("connect").addClass("appCtrl-btn")
                    .click({projectId: project.id}, editFunc);
                appCtrlEdit.text("Edit");
                appCtrlSelect.text("Select");
                //Add functionality

                appCtrlDiv.append(appCtrlEdit);
                appCtrlDiv.append(appCtrlSelect);

//                if(project.id == currentlySelectedProjectId) {
//                    li = $('<li></li>').attr('projectId', project.id).attr('selectedProject', 'true').addClass('row-fluid');
//                }
//                else {
//                    li = $('<li></li>').attr('projectId',project.id).attr('selectedProject','false').addClass('row-fluid');
//                }
                mainDiv.append(appLogoDiv);
                mainDiv.append(appInfoDiv);
                mainDiv.append(appCtrlDiv);
            }
        }
        $('#cldProjectExplorer').find('.projects').remove();
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

    function getProjects() {
//        console.log("_cldSettings",_cldSettings);
//        console.log("_cldSettings.init.settings",_cldSettings.init.settings);
//        console.log("_cldSettings.settings",_cldSettings.settings);
//        console.log("_cldSettings.settings.appSettings",_cldSettings.settings.appSettings);
//        console.log("_cldSettings.settings.appSettings.projects",_cldSettings.settings.appSettings.projects);
        return _cldSettings.settings.appSettings.projects;
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
                compId: compId,
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
                    //TODO move cookie fetcher from editor to 'common.js'
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
        setEditorMode : function() {
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
        }

    };
    return {
        init: function(){
            var startLoading = Date.now();
            var async = initPhases.asyncLoader();

            async.executePhase("setEditorMode",initPhases.setEditorMode);
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