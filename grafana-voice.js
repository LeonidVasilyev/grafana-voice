function checkSingleStats() {
    var isPassed = true;
    var singleStats = document.getElementsByTagName('grafana-panel-singlestat');
    for (var i = 0; i < singleStats.length; ++i) {
        var title = singleStats[i].querySelector('.panel-title-text').innerText
        var isMetricLoaded = singleStats[i].querySelector(".alert-error.panel-error") == null;
        if (!isMetricLoaded) {
            isPassed = false;
            report("DANGER! Can't load " + title + " value" );
            continue;
        }
        
        var color = singleStats[i].querySelector('grafana-panel div').style.backgroundColor;
        var value = singleStats[i].querySelector('.singlestat-panel-value').innerText
        if (value === "N/A") {
            value = "not available";
        }
        if (color === "rgba(245, 54, 54, 0.901961)") {
            isPassed = false;
            report("DANGER! " + title + " value is " + value);
        } else if (color === "rgba(237, 129, 40, 0.890196)") {
            isPassed = false;
            report("WARNING! " + title + " value is " + value);
        }
    }
    return isPassed;
}

function report(message) {
    console.log(message);
    var synth = new SpeechSynthesisUtterance(message);
    synth.pitch = 0;
    synth.rate = 0.9;
    window.speechSynthesis.speak(synth);
}

(function(){
    if (checkSingleStats()) {
        setTimeout(arguments.callee, 10000);
    } else
    {
        setTimeout(arguments.callee, 30000);
    }
})();
