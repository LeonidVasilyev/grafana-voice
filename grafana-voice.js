(function() {
    var speechApi = window.speechSynthesis;
    if (speechApi == null) {
        alert("Web Speech API is not supported by your browser. Please use at least Chrome ver. 33");
        return;
    }
    
    // Settings
    var warningColor = "rgba(237, 129, 40, 0.890196)";
    var dangerColor = "rgba(245, 54, 54, 0.901961)";
    var checkPeriodInSeconds = 10;
    var delayAfterNotifiationInSeconds = 30;
    
    window.onbeforeunload = function() {
        return "You have attempted to leave this page. Voice alerting will be disabled.";
    }
    
    function checkSingleStats() {
        if (speechApi.paused || speechApi.pending || speechApi.speaking) {
            speechApi.resume();
        }
        var isPassed = true;
        var singleStats = document.getElementsByTagName('grafana-panel-singlestat');
        for (var i = 0; i < singleStats.length; ++i) {
            var title = singleStats[i].querySelector('.panel-title-text').innerText
            
            var isDataLoaded = singleStats[i].querySelector(".alert-error.panel-error") == null;
            if (!isDataLoaded) {
                isPassed = false;
                report("DANGER! Can't load " + title + " value", true);
                continue;
            }
            
            var color = singleStats[i].querySelector('grafana-panel div').style.backgroundColor;
            var value = singleStats[i].querySelector('.singlestat-panel-value').innerText
            if (value === "N/A") {
                value = "not available";
            }
            if (color === dangerColor) {
                isPassed = false;
                report("DANGER! " + title + " value is " + value);
            } else if (color === warningColor) {
                isPassed = false;
                report("WARNING! " + title + " value is " + value);
            }
        }
        return isPassed;
    }
    
    function report(message, useLocalService) {
        console.log(message);
        var utterThis = new SpeechSynthesisUtterance(message);
        var voices = window.speechSynthesis.getVoices();
        if (useLocalService) {
            // In case speech paused because of connection issues.
            utterThis.voice = voices.filter(function(voice) { return voice.localService == true; })[0];
        } else {
            utterThis.voice = voices.filter(function(voice) { return voice.lang == "en-US"; })[0];
        }
        utterThis.pitch = 0;
        utterThis.rate = 0.9;
        utterThis.onerror = function(event) {
            alert("An error has occurred with the speech synthesis: " + event.error + " Original message: " + message);
        }
        speechApi.speak(utterThis);
    }
    
    // TODO: Hide only specific link
    // Hide activation link
    var links = document.getElementsByTagName('dash-link')[0];
    if (links != undefined) {
        links.style.display = "none";
    }
    
    (function(){
        if (checkSingleStats()) {
            setTimeout(arguments.callee, checkPeriodInSeconds * 1000);
        } else {
            setTimeout(arguments.callee, delayAfterNotifiationInSeconds * 1000);
        }
    })();
})();
