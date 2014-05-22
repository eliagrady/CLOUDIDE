/* cloud ide editor javascript */

/*jslint browser: true*/
/*global $, jQuery, CodeMirror*/

var CloudIde = {
    settings : {
        appSettings : {}
    },
    cm : {},
    getCodeMirrorConfig : function () {
        //var compId = Wix.Utils.getOrigCompId();
        //var result;
        /*
         $.ajax({
         'type': 'post',
         'url': "/app/update",
         'dataType': "json",
         'contentType': 'application/json; chatset=UTF-8',
         'data': JSON.stringify({
         compId: Wix.Utils.getOrigCompId(),
         settings: {
         appSettings: settings,
         title: 'yo'
         }
         }),
         'cache': false,
         'success': function (res) {
         console.log("update setting completed");
         result = res;
         Wix.Settings.refreshAppByCompIds(compId);
         },
         'error': function (res) {
         console.log('error updating data with message ' + res.responseText);
         }
         });

         if(result) {
         return result;
         }
         */
        return {
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
            autoCloseBrackets : true
        };
    },
    updateStatusBar : function (text, timeout, callback) {
        $('#cldStatusbar').get(0).val(text);
        if(timeout !== undefined) {
            this.updateStatusBar("",undefined,undefined);
        }
        return callback();//TODO check for security and necessity of this op
    },
    save : function (docId,doc) {
        try {
            var instanceId = Wix.Utils.getInstanceId() || "";
            var compId = Wix.Utils.getOrigCompId() || "";
        }
        catch (err) {
            console.log(err);
        }
        //var instance = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        //var comp = 'TPWdgt-d88e26c-217b-505f-196d-2f6d87f1c2db';

        //var code = encodeURI(JSON.stringify(cld.cm.getDoc()));
        //var code = cld.cm.getDoc();

        //var codeVal = encodeURI(JSON.stringify(cld.cm.getDoc().getValue()));
        console.log("about to sent window.debugMode = "+CloudIde.mode);
        var codeVal = cld.cm.getDoc().getValue();
        var encodedVal = encodeURI($.base64.encode(codeVal));
        var currentDate = new Date();
        var projectName = "TestProject";
        var currentProject = {
            name : projectName,
            modified : currentDate,
            code : encodedVal
        };
        //Saving the appSettings JSON
        CloudIde.settings.appSettings.currentProject = currentProject;
        $.ajax({
            'type': 'post',
            'url': "/app/save",
            'dataType': "json",
            'contentType': 'application/json; chatset=UTF-8',
            'data': JSON.stringify({
                compId: compId,
                settings: CloudIde.settings,
                mode : CloudIde.mode
            }),
            'cache': false,
            'success': function (res) {
                console.log("save completed");
                if(window.debugMode === "debug") {
                    window.alert("save completed");
                }
                else {
                    //TODO
                    //Save successfully message here
                    //Wix.Utils.openModal();
                    window.alert("save completed");
                }
                Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
            },
            'error': function (res) {
                console.log('error updating data with message ' + res.responseText);
            }
        });
    },
    loadAllCodeMirrorAddons : function(list) {
        //CloudIde.loadCodeMirrorAddon("fold/foldcode.js");
        CloudIde.loadCodeMirrorAddon("edit/closebrackets.js");
        CloudIde.cm.setOption("autoCloseBrackets",true);
    },
    loadCodeMirrorAddon : function(codeMirrorRelPath) {
        var codeMirrorBaseURL = "../static/lib/codemirror/codemirror-4.0/addon/";
        CloudIde.loadjscssfile(codeMirrorBaseURL+codeMirrorRelPath,"js");


//        $.getScript(codeMirrorBaseURL+codeMirrorRelPath, function( data, textStatus, jqxhr ) {
//            console.log( data ); // Data returned //TODO remove data logging which exposes CodeMirror's internals
//            console.log( textStatus ); // Success
//            console.log( jqxhr.status ); // 200
//            console.log( "Finished loading "+codeMirrorRelPath);
//        });
    },
    loadjscssfile : function (filename, filetype) {
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
    replaceDoc : function () {
        var text = "<script src=\"lib/codemirror.js\"></script>\n<link rel=\"stylesheet\" href=\"../lib/codemirror.css\">\n<script src=\"mode/javascript/javascript.js\"></script>\n";
        return CloudIde.cm.swapDoc(CodeMirror.Doc(text, "javascript", 1));
    },
    init : function() {
        var cldTextArea = $('#cldEditorTextArea');
        if(cldTextArea.length === 0) {
            cldTextArea = $('<textarea id="cldEditorTextArea"></textarea>').appendTo('#cldEditor').get(0);
        }
        //Initialize CodeMirror
        CloudIde.cm = CodeMirror.fromTextArea(cldTextArea, CloudIde.getCodeMirrorConfig());

        //Initialize settings
        if(CloudIde.mode !== "debug") {
            saveSettings();
        }

        //Initialize menu segment
        //Initialize project explorer segment
        //Initialize buttons

        //Initialize status bar segment
        //Load add-ons
        //TODO load it dynamically
        //CloudIde.loadAllCodeMirrorAddons();


        //finally
    },
    loadProjectsToExplorer : function() {
        $.ajax({
            'type': 'post',
            'url': "/app/update",
            'dataType': "json",
            'contentType': 'application/json; chatset=UTF-8',
            'data': JSON.stringify({
                mode : window.debugMode,
                compId: Wix.Utils.getOrigCompId(),
                appData: {
                    appData : null,
                    document: null,
                    command: 'updateProjectView'
                }}),
            'cache': false,
            'success': function (res) {
                console.log("update setting completed");
                //Update display with results:
                console.log("logged success func ret val: "+res);

                var cldPrjExplorer = $('#cldPro').get(0);
                console.log("parsed data: " +JSON.parse(res));

                return res;
            },
            'error': function (res) {
                console.log('error updating data with message ' + res.responseText);
            }
        });
    }
};

