/**
 * Created by Elia on 23/03/14.
 */
//Configuration file is based on the following manual
//http://codemirror.net/doc/manual.html


window.CloudIde = (function () {
  this.codeMirrorConfiguration =
  {
    value: "function myScript() {return 100;}\n", //TODO replace with the Document module
    mode: "javascript",
    indentUnit: 2 , //Integer number for indentation spaces
    smartIndent: true, //Indentation is context sensitive (according to the given mode)
    tabSize: 4, //width of tabs
    indentWithTabs: true, //true means indent with tabs instead of spaces
    lineNumbers: true
  }

  var cm = CodeMirror.fromTextArea(myTextArea, codeMirrorConfiguration);
  var text = "function myScript(arg1,arg2) {return true;}\n";
  var newDoc = CodeMirror.Doc(text, "javascript", 1);
  var oldDoc = cm.swapDoc(newDoc);
  var editor = {};
  /**
   * Constructor for CloudIDE object. Takes optional config parameter.
   */
  function CloudIde(config) {
    if (!(this instanceof CloudIde)) return new CloudIde();
    this.config = config = config || {};
    return this;
  }

//End of code
  return CloudIde;
})();