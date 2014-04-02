/**
 * This function init the settings object with default values or with values that were saved in the DB
 */

function saveSettings() {
    var code=encodeURI($('#codeTest').val());
    var compId = Wix.Utils.getOrigCompId();

    $.ajax({
        'type': 'post',
        'url': "/app/settingsupdate",
        'dataType': "json",
        'contentType': 'application/json; chatset=UTF-8',
        'data': JSON.stringify({compId: Wix.Utils.getOrigCompId(), settings: {
            appSettings:code,
            title:'yo'
        }}),
        'cache': false,
        'success': function(res) {
            console.log("update setting completed");

            Wix.Settings.refreshAppByCompIds(compId);
        },
        'error': function(res) {
            console.log('error updating data with message ' + res.responseText);
        }
    });
}

<button id="yo">Click</button>

<script type="text/javascript">
    function test(){
        Wix.openModal('http://wix.com',400,400,
            function(){         alert('bye');     });     }

    $('#yo').click(test);

</script>




