// BrowserCheck.js
// All rights reserved 2011, StateForge.

function browserCheck() {
    if (window.File) {
    } else {
        //alert('The File APIs are not fully supported in this browser.');
    }

    if (Modernizr.localstorage) {
    } else {
        //alert('The Storage APIs are not fully supported in this browser.');
    }

    if (checkVersion() == false) {
        $("#BrowserCheck").append("<p>Warning: The State Diagram Generator does not work properly with this version of Internet Explorer<p>");
        $("#BrowserCheck").append("<p>Note: The <a href=\"../Home/Download\"> Finite State Machine Source Code Generators</a> are *not* affected by these browsers imcompatibilities.<p>");
    }
}

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

function checkVersion() {
    var msg = "You're not using Internet Explorer.";
    var ver = getInternetExplorerVersion();
    var ok = true;
    if (ver > -1) {
        if (ver >= 8.0) {
            msg = "You're using a recent copy of Internet Explorer."
        } else {
            msg = "You should upgrade your copy of Internet Explorer.";
            ok = false
        }
    }

    //alert(msg);
    return ok;

}

