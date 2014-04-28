/**
 * Init the input elements
 * Init the input  with a start value, a one that was saved in the DB or a default one
 */
function initInputElms() {
    $('#numOfEntries').val(appSettings.settings.styling.numOfEntries);
}

/**
 * Bind events
 * Listen to changes of the elements
 */
function bindEvents () {
//    var $rssFeedUrl = $('#rssFeedUrl');
//    var $numOfEntriesInput = $('#numOfEntries');
//
//    var lastValue = '';
//    // user has connected a feed
//    $('#connectBtn').click( function(){
//        if(lastValue !== $rssFeedUrl.val()){
//            lastValue = appSettings.settings.feedInputUrl = $rssFeedUrl.val();
//            displayHeader();
//            updateSettingsProperty("feedInputUrl", appSettings.settings.feedInputUrl);
//        }
//    });
//
//    // user has disconnected from the feed
//    $('.disconnect-account').click(function(){
//        updateSettingsProperty("feedInputUrl", "");
//        lastValue = '';
//        $rssFeedUrl.val("");
//        $rssFeedUrl.focus();
//
//        // hide guest description and show connected description
//        $('.loggedIn').addClass('hidden');
//        $('.loggedOut').removeClass('hidden');
//    });

    $('#refreshBtn').click(function() {Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId())});

//
//    $numOfEntriesInput.change( function(){
//        updateStylingProperty($numOfEntriesInput.attr("id"), $numOfEntriesInput.val());
//    });
}

/**
 * Display a header in the settings form
 * If a user is connected to the widget (inserted a RSS feed link) the user section will be displayed,
 * otherwise the guest section will be displayed
 */
function displayHeader() {
    "use strict";
//
//    var guestSection = $('.loggedOut');
//    var userSection = $('.loggedIn');
//
//    // If the feed url is initilized than the user already inserted a url, otherwise the guest section will
//    // be displayed and the user will be able to insert a new feed url
//    if (!appSettings.settings.feedInputUrl || appSettings.settings.feedInputUrl === "") {
//        guestSection.removeClass('hidden');
//        userSection.addClass('hidden');
//    }
//    else {
//        loadFeedTitleAndDescription();
//        guestSection.addClass('hidden');
//        userSection.removeClass('hidden');
    return;
    }


/**
 * Load the feed with the google api feed
 */
function loadFeedTitleAndDescription() {
    "use strict";
    return;
//
//    // Create a feed instance that will grab feed.
//    var feed = new google.feeds.Feed(appSettings.settings.feedInputUrl);
//
//    // Sets the result format
//    feed.setResultFormat(google.feeds.Feed.JSON_FORMAT);
//
//    feed.load(function(result) {
//        var $feedLink = $('#feedLink');
//        if (!result.error) {
//            $feedLink.attr('href', result.feed.link);
//            $feedLink.text(result.feed.title);
//            $('.feed-description').html(result.feed.description);
//        } else {
//            //handle Error
//        }
//    });
}

/**
 * Update a settings property in the settings object and update the settings object in the db by posting an ajax request
 * @param key - in the settings object
 * @param value - the new value
 */
function updateSettingsProperty(key, value) {
    var settings = appSettings.settings;
    settings[key] = value;
    updateSettings(settings);
}
/**
 * Updating the settings object in the DB by posting an ajax request
 * @param settingsJson
 */
function updateSettings(settingsJson) {
    var settingsStr = JSON.stringify(settingsJson) || "";
    var compId = Wix.Utils.getOrigCompId();

    $.ajax({
        'type': 'post',
        'url': "/app/settingsupdate",
        'dataType': "json",
        'contentType': 'application/json; chatset=UTF-8',
        'data': JSON.stringify({compId: Wix.Utils.getOrigCompId(), settings: settingsJson}),
        'cache': false,
        'success': function(res) {
            console.log("update setting completed");
            appSettings.settings = settingsJson;
            Wix.Settings.refreshAppByCompIds(compId);
        },
        'error': function(res) {
            console.log('error updating data with message ' + res.responseText);
        }
    });
}



// load google feed scripts - should be done in the beginning
//google.load("feeds", "1");

$(document).ready(function() {

    window.appSettings = {};

    // Getting newSettings that was set as parameter in settings.vm
    // Check that newSettings is initialized with value
    appSettings.settings = newAppSettings || {};

    applySettings();
    //displayHeader();
    bindEvents();
    //initInputElms();
    Wix.UI.initialize();
});


//function updateSettings(settingsJson) {
//    var settingsStr = JSON.stringify(settingsJson) || "";
//    var compId = Wix.Utils.settingsJson();
//    $.ajax({
//        'type': 'post',
//        'url': "/app/settingsupdate?instance=" + appSettings.instance ,
//        'data': JSON.stringify(
//            {
//                compId: Wix.Utils.getOrigCompId(), settings: settingsStr}),
//        'cache': false,
//        'success': function(res) {
//            console.log("update setting completed");
//            appSettings.settings = settingsJson;
//            Wix.Settings.refreshAppByCompIds(compId);
//        },
//        'error': function(res) {
//            console.log('error updating data to the app server');
//        }
//    });
//}