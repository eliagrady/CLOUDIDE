///* cloud ide editor javascript */
//
///*jslint browser: true*/
///*global $, jQuery, CodeMirror, Wix, console, window*/
//
///**
// * This function init the settings object with default values or with values that were saved in the DB
// */
//
//function saveSettings(settingsJson) {
//    "use strict";
//    var settingsStr = JSON.stringify(settingsJson) || "";
//    var compId = Wix.Utils.getOrigCompId();
//    var date = new Date().toDateString();
//    $.ajax({
//        'type': 'post',
//        'url': "/app/settingsupdate",
//        'dataType': "json",
//        'contentType': 'application/json; chatset=UTF-8',
//        'data': JSON.stringify({compId: Wix.Utils.getOrigCompId(), settings: {
//            appSettings: settingsJson,
//            title: date
//        }}),
//        'cache': false,
//        'success': function (res) {
//            console.log("update setting completed");
//
//            Wix.Settings.refreshAppByCompIds(compId);
//        },
//        'error': function (res) {
//            console.log('error updating data with message ' + res.responseText);
//        }
//    });
//}
//
///**
// * This function init the settings object with default values or with values that were saved in the DB
// */
//function applySettings() {
//    // App Settings Json
//    appSettings.settings.appSettings = appSettings.settings.appSettings || {};
//
//    // App Settings title
//    appSettings.settings.title = appSettings.settings.title || "Default title";
//}
//
//
//
//
//
//
//
//
//
//
//
