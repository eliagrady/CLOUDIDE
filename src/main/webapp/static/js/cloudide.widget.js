/* cloud ide widget javascript */

/*jslint browser: true*/
/*global $, jQuery, CodeMirror , appData , appSettings*/


/**
* Class containing widget property and functions
*/
var _cldWidget = (function() {
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
        else {
            return;
        }

        $('#cldEditorOpen').hover(
            //on mouseover
            function() {
                $(this).stop(true,true);
                $(this).animate({
                        width: '+=50', //adds 250px
                        right: "+=10"
                    }, 'fast' //sets animation speed to slow
                );
            },
            //on mouseout
            function() {
                $(this).stop(true,true);
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
                    //TODO change compId logic?
                    var compId = Wix.Utils.getCompId();
                    var instanceId = Wix.Utils.getInstanceId();
                    //var url = 'http://wixcloudide.appspot.com/app/editor?instanceId='+instanceId+"&compId="+compId;
                    var url = 'http://wixcloudide.appspot.com/app/editor';
                    Wix.openModal(url,window.screen.width*0.8, window.screen.height*0.6,onClose);
                    //http://wixcloudide.appspot.com/app/editor?instanceId=134915a5-1abd-e7ef-b605-6ed8061489f5&cacheKiller=140106326518122&compId=TPMdl7-bpi&deviceType=desktop&instance=ZtHW253uXw_R4tdcQU0gnu0kgoaugDg89fcnRrkuE6A.eyJpbnN0YW5jZUlkIjoiMTM0OTE1YTUtMWFiZC1lN2VmLWI2MDUtNmVkODA2MTQ4OWY1Iiwic2lnbkRhdGUiOiIyMDE0LTA1LTI1VDE4OjMwOjMyLjI0Mi0wNTowMCIsInVpZCI6ImMwYTNkN2IzLThjOTAtNGIzYy1iZmZhLTUwOTI2NDljY2MzYSIsInBlcm1pc3Npb25zIjoiT1dORVIiLCJpcEFuZFBvcnQiOiIxMDkuNjUuMzguMTg1LzYzOTc2IiwiZGVtb01vZGUiOmZhbHNlfQ&locale=en&viewMode=preview&origCompId=TPWdgt4-5aq
                }
            }
        );
    }

    function appendCode() {
        //Validate appData for malicious code!
        //$('#hero').innerHTML = appData.appData;
        var codeHtml = Base64.decode(decodeURI(_cldWidget.currentProject.code.html));
        var codeJs = Base64.decode(decodeURI(_cldWidget.currentProject.code.js));
        var codeCss = Base64.decode(decodeURI(_cldWidget.currentProject.code.css));
        $('#cldJs').html(codeJs);
        $('#cldCss').html(codeCss);
        $('#cldHtml').html(codeHtml);
    }

    function appendDefault() {
        //Validate appData for malicious code!
        //$('#hero').innerHTML = appData.appData;

        //$('#cldJs').html(codeJs);
        //$('#cldCss').html(codeCss);
        //$('#cldHtml').html(codeHtml);
        var $body = $('body');
        var $text = $('<div></div>').addClass('addNewProjectTextStyling').text('Double click me, and assign a project to start using this Widget!');
        $body.append($text);
    }

    // Public functions
    return {
        init: function(currentProject){
            //TODO project loader

            function getURLParameter(sParam) {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] == sParam) {
                        return sParameterName[1];
                    }
                }
            };
            //var projectId = getURLParameter('loadProject');


            _cldWidget.currentProject = currentProject;


            //When this val is set to true, the app will skip authentication for the update endpoints
//            if(window.location.origin == "http://localhost:8080") {
//                _cldWidget.mode = "debug";
//            }
//            else {
//                _cldWidget.mode = "";
//            }
            //applySettings();
            //loadFeed();
            try{
                //'Edit' button inside the Wix editor (deprecated)
                //custom();
            }
            catch (err) {

            }
            try {
                appendCode();
                console.log("code injected");
            }
            catch (err) {
                appendDefault();
                console.log("failed injecting code!");
            }
            //Release global
            //currentProject = undefined;
        }
    };

}());

//google.load("feeds", "1");

$(document).ready(function() {
    try {
        _cldWidget.init(currentProject);
    }
    catch (err) {
        console.log("init failed:");
        console.log(err);
    }
});