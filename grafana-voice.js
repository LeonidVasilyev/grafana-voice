function checkSingleStats() {
    var singleStats = document.getElementsByTagName('grafana-panel-singlestat');
    for (var i = 0; i < singleStats.length; ++i) {
        var color = singleStats[i].querySelector('grafana-panel div').style.backgroundColor;
        var title = singleStats[i].querySelector('.panel-title-text').innerText
            var value = singleStats[i].querySelector('.singlestat-panel-value').innerText
        if (color === "rgba(245, 54, 54, 0.901961)") {
            report("DANGER! - " + title + " value is " + value);
        } else if (color === "rgba(237, 129, 40, 0.890196)") {
            report("WARNING! - " + title + " value is " + value);
        }
    }
}

function report(message) {
    console.log(message);
    var synth = new SpeechSynthesisUtterance(message);
    synth.voice = window.speechSynthesis.getVoices()[4];
    synth.pitch = 0;
    synth.rate = 0.8
    window.speechSynthesis.speak(synth);
}

(function(){
    checkSingleStats();
    setTimeout(arguments.callee, 10000);
})();
