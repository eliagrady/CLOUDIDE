/* cloud ide editor javascript */

/*jslint browser: true*/
/*global $, jQuery, CodeMirror*/


function CloudIde(timeout) {
    timeout = timeout || timeout;
    "use strict";
    CloudIde.codeMirrorConfiguration =  {
        mode: "javascript",
        indentUnit: 2, //Integer number for indentation spaces
        smartIndent: true, //Indentation is context sensitive (according to the given mode)
        tabSize: 4, //width of tabs
        indentWithTabs: true, //true means indent with tabs instead of spaces
        lineNumbers: true
    };
    this.init = function () {
        //Initialize menu segment
        var menu = $('#cldMenubar').get(0);
        $('<button id="cldMenubarBttSave">Save</button>').appendTo(menu);

        //Initialize project explorer segment
        var explorer = $('#cldSidebar').get(0);
        ($('<div id="cldSidbarPrj"><ul></ul></div>')).appendTo(explorer).get(0);
            //Get and and list all the projects (foreach)
        $('<li>filename.js</li>').appendTo($('ul'));


        //Initialize status bar segment
        var status = $('#cldStatusbar').get(0);
        status.val = "initializing editor"; //TODO replace with progress bar anim


        //Initialize CodeMirror
        if ($('#cldEditorTextArea').size() !== 0) {
            return;
        }
        var cldTextArea = $('<textarea id="cldEditorTextArea"></textarea>').appendTo('#cldEditor').get(0);
        CloudIde.cm = CodeMirror.fromTextArea(cldTextArea, this.codeMirrorConfiguration);

        //Load add-ons
    };

    CloudIde.updateStatusBar = function (text, timeout, callback) {
        $('#cldStatusbar').get(0).val(text);
        if(timeout !== undefined) {
            this.updateStatusBar("",undefined,undefined);
        }
        return callback();//TODO check for security and necessity of this op
    };


    CloudIde.save = function (filename) {
        
    };

    CloudIde.functionName = function() {
        "use strict";
        var code = encodeURI($('#codeTest').val());
        var compId = Wix.Utils.getOrigCompId();

        $.ajax({
            'type': 'post',
            'url': "/app/settingsupdate",
            'dataType': "json",
            'contentType': 'application/json; chatset=UTF-8',
            'data': JSON.stringify({compId: Wix.Utils.getOrigCompId(), settings: {
                appSettings: code,
                title: 'yo'
            }}),
            'cache': false,
            'success': function (res) {
                console.log("update setting completed");

                Wix.Settings.refreshAppByCompIds(compId);
            },
            'error': function (res) {
                console.log('error updating data with message ' + res.responseText);
            }
        });
    };





    CloudIde.replaceDoc = function () {
        var text = "<script src=\"lib/codemirror.js\"></script>\n<link rel=\"stylesheet\" href=\"../lib/codemirror.css\">\n<script src=\"mode/javascript/javascript.js\"></script>\n";
        return CloudIde.cm.swapDoc(CodeMirror.Doc(text, "javascript", 1));
    };
    return this;
}

function element(text) {
    "use strict";
    return $(text).get(0);
}
