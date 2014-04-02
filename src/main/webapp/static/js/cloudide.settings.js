/**
 * function 1: Apply settings  - initialize model settings with default values if it was not initialized by the server.
 * @type {string|*|rssModel.settings.feedInputUrl}
 */



// RSS feed link
//rssModel.settings.feedInputUrl = rssModel.settings.feedInputUrl || "";
// Number of entries in the RSS feed
//rssModel.settings.styling.numOfEntries = rssModel.settings.styling.numOfEntries || 4;


/**
 * function 2: Display header - display the section of the user or login depending on the status of the user's login.
 * @type {*|jQuery|HTMLElement}
 */
var $currentDocument = $('#rssFeedUrl')

var lastValue = '';
// user has connected a feed
$('#updateSettingsBtn').click(saveSettings);

/**
 * function 3: Bind events - bind the controls to functions handling their updates
 */
$numOfEntriesInput.change( function(){
    updateSettingsProperty($numOfEntriesInput.attr("id"), $numOfEntriesInput.val());
});


/**
 * function 4: Save user's defined properties in the server DB
 * @param key the key to store the property
 * @param value the value of the property to set
 */
function updateSettingsProperty(key, value) {
    var settings = rssModel.settings;
    settings[key] = value;
    updateSettings(settings);
}

function updateSettings(settingsJson) {
    var settingsStr = JSON.stringify(settingsJson) || "";
    var compId = Wix.Utils.settingsJson();
    $.ajax({
        'type': 'post',
        'url': "/app/settingsupdate?instance=" + rssModel.instance ,
        'data': JSON.stringify(
            {
                compId: Wix.Utils.getOrigCompId(), settings: settingsStr}),
                'cache': false,
                'success': function(res) {
                    console.log("update setting completed");
                    rssModel.settings = settingsJson;
                    Wix.Settings.refreshAppByCompIds(compId);
        },
        'error': function(res) {
            console.log('error updating data to the app server');
        }
    });
}
 