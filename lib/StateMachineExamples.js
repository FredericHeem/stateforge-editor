// StateMachineExamples.js
// All rights reserved 2011-2015, StateForge.
// Frederic Heem - frederic.heem@gmail.com

var examplesDotNetArray = new Array(
  "Light",
  "Led",
  "Turnstile",
  "TrafficLight",
  "Ping",
  "BookingProcess",
  "Microwave",
  "WashingMachine",
  "Seminar",
  "Door",
  "DoorTest01",
  "DoorTest02",
  "TestChat01",
  "TestLogin02",
  "TestRegisterNewAccount",
  "TestOpenClose01",
  "TestOpenClose02",
  "TestRosterAdd",
  "TestRosterAddRemove",
  "TestSubscription01",
  "TestUnSubscribe"
);

var examplesCppArray = new Array(
  "HelloWorld",
  "Led",
  "Light",
  "Ping",
  "Door",
  "DoorTester",
  "TrafficLight",
  "WashingMachine",
  "Microwave",
  "Microwave02",
  "LoginMvc",
  "Robot",
  "UrlGet",
  "Samek",
  "Tr69Connection",
  "Tr69ConnectionRequestResponder",
  "Tr69ConnectionRequestServer",
  "AcsClient",
  "AcsConnection",
  "AcsRequestDownload",
  "AcsRequestReboot"
);

var examplesJavaArray = new Array(
  "RippleWsClient",
  "FeedFetcher",
  "HelloWorld",
  "Led",
  "Microwave",
  "Ping",
  "TrafficLight",
  "PelicanCrossing"
);

var screenshootArray = new Array(
  "Door",
  "HelloWorld",
  "Light",
  "Ping",
  "TrafficLight",
  "WashingMachine",
  "XmppRosterAdd",
  "UrlGet"
);

function examplesCreateAll() {
    examplesCreate("examplesDotNetUL", examplesDotNetArray, "/examples/dotnet", "fsmcs");
    examplesCreate("examplesCppUL", examplesCppArray, "/examples/cpp", "fsmcpp");
    examplesCreate("examplesJavaUL", examplesJavaArray, "/examples/java", "fsmjava");
}

function getStateMachineUrlFromName(name, urlPrefix, fileSuffix) {
    return urlPrefix + '/' + name + "." + fileSuffix;
}

function examplesCreate(div, array, urlPrefix, fileSuffix) {
    var examplesDiv = document.getElementById(div);
    for (i = 0; i < array.length; i++) {
        var example = array[i]

        var li = document.createElement("li");
        examplesDiv.appendChild(li);
        var anchor = document.createElement("a");
        li.appendChild(anchor);
        anchor.setAttribute("href", "/StateMachineDiagram/StateMachineDiagram.html?fsmUrl=" + getStateMachineUrlFromName(example, urlPrefix, fileSuffix) + "#");
        anchor.setAttribute("class", "SateMachineExample");
        anchor.appendChild(document.createTextNode(example));
    }
}

$(document).ready(function () {

    if (jQuery('#examplesCarousel').size() == 0) {
        return
    }

    jQuery('#examplesCarousel').jcarousel({
        scroll: 1,
        itemLoadCallback: mycarousel_itemLoadCallback,
        auto: 4,
        wrap: 'last',
        initCallback: mycarousel_initCallback
    });
});

function mycarousel_initCallback(carousel) {
    // Disable autoscrolling if the user clicks the prev or next button.
    carousel.buttonNext.bind('click', function () {
        carousel.startAuto(0);
    });

    carousel.buttonPrev.bind('click', function () {
        carousel.startAuto(0);
    });

    // Pause autoscrolling if the user moves with the cursor over the clip.
    carousel.clip.hover(function () {
        carousel.stopAuto();
    }, function () {
        carousel.startAuto();
    });
};

function mycarousel_itemLoadCallback(carousel, state) {
    // Since we get all URLs in one file, we simply add all items
    // at once and set the size accordingly.
    if (state != 'init')
        return;

    var array = screenshootArray;
    for (i = 0; i < array.length; i++) {
        var example = array[i]
        carousel.add(i + 1, mycarousel_getItemHTML(array[i]));
    }

    carousel.size(array.length);
};

function mycarousel_getItemHTML(name) {
    var url = "/StateMachineDiagram/Img/" + name + "StateMachine.png"
    return '<img src="' + url + '" alt="' + name + '" />';
};