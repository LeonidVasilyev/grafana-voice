(function() {
  if (window.speechSynthesis == null) {
    alert("Web Speech API is not supported by your browser. Please use at least Chrome ver. 33");
    return;
  }
  
  var Status = Object.freeze({OK: 1, WARNING: 2, CRITICAL:3});
  var ReportType = Object.freeze({NOT_LOADED: 1, NULL_VALUE: 2, VALUE: 3});
    
  function checkSingleStats() {
    if (window.speechSynthesis.paused || window.speechSynthesis.pending || window.speechSynthesis.speaking) {
      // Workaround strange window.speechSyntesis freeze.
      // TODO: Fix long phrases cut.
      window.speechSynthesis.cancel();
    }
    
    var singleStats = document.getElementsByTagName('grafana-panel-singlestat');
    var reports = [];
    for (var i = 0, singleStat; singleStat = singleStats[i]; ++i) {
      var metric = { 
        title: singleStat.querySelector('.panel-title-text').innerText, 
        isLoaded: singleStat.querySelector(".alert-error.panel-error") == null,
        color: singleStat.querySelector('grafana-panel div').style.backgroundColor,
        value: singleStat.querySelector('.singlestat-panel-value').innerText
      };
      
      if (!metric.isLoaded) {
        reports.push({status: Status.WARNING, type: ReportType.NOT_LOADED, metric: metric});
      } else if (metric.value === "N/A") {
        reports.push({status: Status.WARNING, type: ReportType.NULL_VALUE, metric: metric});
      } else if (metric.color === "rgba(237, 129, 40, 0.890196)") {
        reports.push({status: Status.WARNING, type: ReportType.VALUE, metric: metric});
      } else if (metric.color === "rgba(245, 54, 54, 0.901961)") {
        reports.push({status: Status.CRITICAL, type: ReportType.VALUE, metric: metric});
      }
    }
    
    if (reports.length === 0) {
      return true;
    }
    
    // Sort from most dangerous to least dangerours errors.
    reports.sort(function(r1, r2) { return r2.status - r1.status;});
    var message = getLocalizedStatusPrefix(reports[0].status) + ": ";
    for (var i = 0, report; report = reports[i]; ++i) {
      message += getLocalizedReportMessage(report) + ", ";
    }
    console.log(message);
    sayLocalized(message);
    return false;
  };
  
  function getLocalizedStatusPrefix(status) {
    if (status === Status.CRITICAL) {
      return "Danger";
    } else {
      return "Warning";
    }
  };
  
  function getLocalizedReportMessage(report) {
    if (report.type === ReportType.VALUE) {
        return report.metric.title + " value is " + report.metric.value;
      } else if (report.type === ReportType.NULL_VALUE) {
        return report.metric.title + " is not available";
      } else if (report.type === ReportType.NOT_LOADED) {
        return "can't load " + report.metric.title + " value";
      }
  };
  
  function sayLocalized(message, retryCount) {
    var utterThis = new SpeechSynthesisUtterance(message);
    var voices = window.speechSynthesis.getVoices()
      .filter(function(voice) { return voice.voiceURI === "Google UK English Male";});
    if (voices.length === 0) {
      if (retryCount === undefined) {
        setTimeout(sayLocalized, 5000, message, 2);
      } else if (retryCount > 0) {
        setTimeout(sayLocalized, 5000, message, --retryCount);
      } else {
        console.log("Failed to say message '" + message + "' after 3 retry.");
      }
      return;
    }
    utterThis.voice = voices[0];
    utterThis.onerror = function(event) {
      alert("An error has occurred with the speech synthesis: " + event.error + " Original message: " + message);
    }
    window.speechSynthesis.speak(utterThis);
  };
  
  // TODO: Hide only specific link
  var links = document.getElementsByTagName('dash-link')[0];
  if (links != undefined) {
    links.style.display = "none";
  }
  
  window.onbeforeunload = function() {
    return "You have attempted to leave this page. Voice alerting will be disabled.";
  };
  
  console.log("Alerting activated.");
  sayLocalized("Alerting activated.");
  
  (function(){
        if (checkSingleStats()) {
            setTimeout(arguments.callee, 10000);
        } else {
            setTimeout(arguments.callee, 30000);
        }
    })();
})();
