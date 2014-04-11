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
        menu.appendChild($('<div id="cldMenubarBttSave">Save</div>').get(0));
        menu.appendChild($('<div id="cldMenubarBttUndo">Undo</div>').get(0));
        menu.appendChild($('<div id="cldMenubarBttRedo">Redo</div>'));

        //Initialize project explorer segment
        var explorer = $('#cldSidebar').get(0);
        explorer.appendChild($('<div id="cldSidbarPrj"><ul></ul></div>'));
            //Get and and list all the projects (foreach)
        $('ul').appendChild($('<li>filename.js</li>'));


        //Initialize status bar segment
        var status = $('#cldStatusbar').get(0);
        status.val = "initializing editor"; //TODO replace with progress bar anim


        //Initialize CodeMirror
        if ($('#cldEditorTextArea').size() !== 0) {
            return;
        }
        var cldTextArea = $('<textarea id="cldEditorTextArea"></textarea>').appendTo('#cldEditor').get(0);
        CloudIde.cm = CodeMirror.fromTextArea(cldTextArea, this.codeMirrorConfiguration);
    };

    CloudIde.updateStatusBar = function (text, timeout, callback) {
        $('#cldStatusbar').get(0).val(text);
        if(timeout !== undefined) {
            this.updateStatusBar("",undefined,undefined);
        }
        return callback();//TODO check for security and necessity of this op
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
