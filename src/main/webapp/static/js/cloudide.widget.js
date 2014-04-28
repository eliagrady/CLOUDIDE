/**
* Class containing widget property and functions
*/
var _codeWidget = (function() {
    /**
     * Load the feed content using google API
     */
    function loadFeed() {
        // Init the feed URL
        initFeedUrl();

        // Create a feed instance that will grab Digg's feed.
        var feed = new google.feeds.Feed(appSettings.settings.feedInputUrl);
        // Set the number of feed entries that will be loaded by this feed
        feed.setNumEntries(appSettings.settings.numOfEntries);
        // Sets the result format
        feed.setResultFormat(google.feeds.Feed.JSON_FORMAT);

        feed.load(function(result) {
            if (!result.error) {
                $('#feedTitle').text(result.feed.title);
                setFeed(result.feed.entries);
            }
        });
    }

    /**
     * If the feed url is initilized than the user already inserted a url, otherwise a default value will be initialize so feed will
     * be displayed to website users
     */
    function initFeedUrl(){
        if (!appSettings.settings.feedInputUrl || appSettings.settings.feedInputUrl == "") {
            //default url
            appSettings.settings.feedInputUrl = "http://rss.cnn.com/rss/edition.rss"
        }
    }

    /**
     * Set feed entries
     * @param entries
     */
    function setFeed(entries) {
        var $feedEntries = $('#feedEntries');

        var tpl = '<a class="entry-link" href="{{link}}" target="_blank">' +
            '<div class="feed">' +
            '<div class="title">{{title}}</div>' +
            '<div class="content"><p>{{content}}</p></div>' +
            '</div>' +
            '</a>';

        var $div = $('<div>');

        for (var i=0; i<entries.length; i++) {
            var data = entries[i];

            var html = tpl.replace('{{link}}', data.link)
                .replace('{{title}}', data.title)
                .replace('{{content}}', $div.html(data.content).html());

            $feedEntries.append(html);
        }

        // Remove the border from the last feed class element
        $(".feed:last").css('border-bottom', 'none');
    }

    /**
     * This function init the settings object with default values or with values that were saved in the DB
     */

    function applySettings() {
        // RSS feed link
        appSettings.settings.feedInputUrl = appSettings.settings.feedInputUrl || "";

        // Number of entries in the RSS feed
        appSettings.settings.numOfEntries = appSettings.settings.numOfEntries || 4;
    }

    function custom () {
        if(Wix.Utils.getViewMode() !== 'site') {
            $('<div id="cldEditorOpen" class="round_shadow_button">edit</div>').appendTo('#body');
        }
        $('#body').append('<h1>test test</h1>');
        //Validate appData for malicious code!
        $('#hero').append(data.appData);

        $('#cldEditorOpen').hover(
            //on mouseover
            function() {
                $(this).animate({
                        width: '+=50', //adds 250px
                        right: "+=10"
                    }, 'fast' //sets animation speed to slow
                );
            },
            //on mouseout
            function() {
                $(this).animate({
                        width: '-=50px', //substracts 250px
                        right: "-=10"
                    }, 'normal'
                );
            }
        );


        $('#cldEditorOpen').click(
            function () {
                onClose = function() {
                    Wix.Settings.refreshAppByCompIds(Wix.Utils.getOrigCompId());
                    console.log("onClose: app refreshed");
                };
                //var url = 'http://localhost:8080/app/editorstandalone?instanceId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
                var local = false;
                if(local) {
                    var localUrl = 'http://localhost:8080/app/editor?instanceId=${appInstance.getInstanceId()}';
                    Wix.openModal(localUrl,window.screen.width*0.8, window.screen.height*0.6,onClose);
                }
                else {
                    var url = 'http://wixcloudide.appspot.com/app/editor?instanceId=${appInstance.getInstanceId()}';
                    Wix.openModal(url,window.screen.width*0.8, window.screen.height*0.6,onClose);
                }
            }
        );
    }

    // Public functions
    return {
        init: function(){
            //applySettings();
            //loadFeed();
            custom();
        }
    };

}());

//google.load("feeds", "1");

$(document).ready(function() {
    var settings = newAppSettings || {};
    _codeWidget.init();
    _codeWidget.appSettings = settings;
});