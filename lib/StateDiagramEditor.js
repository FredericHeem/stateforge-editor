"use strict";

var StateMachineController = require('./StateMachineController.js');
var StateCodeEditor = require('./StateCodeEditor.js');

var stateEditorMainWindow;//set only for desktop version
var stateDiagramEditor;

var StateDiagramEditor = function(){
    
    var tabView;
    var tabCurrentName;
    var controller = new StateMachineController();
    initController();
    
    var editor = new StateCodeEditor();
    var _from;
    tabViewInit();
    initDiagram();
    
    function initController(){
        controller.emitter.on("modelMofified", modelModified.bind(this));
        controller.emitter.on("error", onControllerError.bind(this));
    }
    
    //Desktop only
    //When the model is modified, add a * next to the filename in the window bar
    //to indicate that the state machine needs to be saved to disk.
    function modelModified() {
        if (stateEditorMainWindow != undefined) {
            stateEditorMainWindow.modelModified()
        }
    }

    function onControllerError(error){
        controller.emitter.on("error", modelModified.bind(this));
    }
    
    function tabViewInit() {
        
        $("#TabView").children("ul").removeClass("ui-corner-all");
        $(".ui-tabs-nav").children("li").removeClass("ui-corner-top");
        
        tabView = $("#TabView").tabs({
            show: function (event, ui) {
                switch (ui.index) {
                    case 0: handleClickTabWelcome(event); break
                    case 1: handleClickTabState(event); break
                    case 2: handleClickTabEvent(event); break
                    case 3: handleClickTabXmlCode(event); break
                }
            }
        });

        //if (stateEditorMainWindow) {
            //To remove code editor in desktop
            //tabView.tabs('remove', 3);
        //}

        $("#TabView").removeClass("ui-corner-all")

        tabView.tabs('option', 'selected', 0);

        function handleClickTabWelcome(e) {
            tabCurrentName = "Welcome"
            $("body").css("overflow", "visible")
            tabCurrentName = "State"
        }

        function handleClickTabState(e) {
            if (tabCurrentName == "XmlCode") {
                xmlCodeOnExit()
            }

            $("body").css("overflow", "visible")
            tabCurrentName = "State"
            controller.viewStateBuild()
        }

        function handleClickTabEvent(e) {
            if (tabCurrentName == "XmlCode") {
                xmlCodeOnExit()
            }
            
            $("body").css("overflow", "visible")
            tabCurrentName = "Event"
            controller.viewEventBuild()
        }

        function handleClickTabXmlCode() {
            $("body").css("overflow", "hidden")
            tabCurrentName = "XmlCode"
            editor.update(controller.domToXml())
        }

        function tabExit(newTab) {

            if (tabCurrentName == "XmlCode") {
                xmlCodeOnExit()
            }
        }

        function xmlCodeOnExit() {
            editor.getSession().on('change', function () {
            });
            controller.modelBuild(editor.GetContent())
        }
    }
    
    function initDiagram() {
        if (stateEditorMainWindow) {
            $("#TopMenu").css("display", "none")
            $("#StateEditorDesktopAlert").css("display", "none")
        }

        if (_from == "fromLocalFile") {
        } else {
            showFsmFileFromUrl()
        }
    }

    function showFsmFileFromUrl(hash) {
        var fsmUrl = getParameterByName("fsmUrl")
        if (fsmUrl) {
            retrieveFsmContentFromUrl(fsmUrl);
            return true
        }

        return false
    }

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    function retrieveFsmContentFromUrl(url) {
        // TODO add error handling
        $.get(url,
          {},
           function (data) {
               onContentReceived(data)
           },
          "text"
          );
    }

    function onContentReceived(data) {
        tabView.tabs('option', 'active', 1);
        controller.modelBuild(data)
        controller.viewStateBuild();
        controller.viewEventBuild();
    }

    function getFsmFileFromLocalStorage() {
        var stateMachineXmlInCache = localStorageGet('StateMachineXml')
        controller.modelBuild(stateMachineXmlInCache)
    }

    function localStorageSet(key, value) {
        if (Modernizr.localstorage) {
            localStorage.setItem(key, value);
        }
    }

    function localStorageGet(key) {
        if (Modernizr.localstorage) {
            localStorage.getItem(key);
        }
    }
    
    this.setXmlContent = function (xmlContent) {
        onContentReceived(xmlContent)
    }
    
    this.getXmlContent = function () {
        return controller.getXmlContent()
    }
}

function stateMachineGetXmlContent() {
    return stateDiagramEditor.getXmlContent()
}

function stateMachineSetXmlContent() {
    if (stateEditorMainWindow != undefined) {
        stateDiagramEditor = new StateDiagramEditor()
        stateDiagramEditor.init("fromLocalFile")
        stateDiagramEditor.setXmlContent(stateEditorMainWindow.getXmlContent())
    }
}

function stateMachineGetWidth() {
//TODO
    return $("#StateMachineDiagram").children("div").width() + 2;
}

function stateMachineGetOffsetLeft() {
    return $("#StateMachineDiagram").children("div").offset().left
}

function stateMachineGetHeight() {
//TODO
    return $("#StateMachineDiagram").children("div").height() + 2
}

function stateMachineGetOffsetTop() {
    return $("#StateMachineDiagram").children("div").offset().top
}

function stateMachineRemoveBackground() {
    $('#TabView,body').removeClass('ui-widget-content');
}

function stateMachineAddBackground() {
    $('#TabView,body').addClass('ui-widget-content');
}

module.exports = StateDiagramEditor;
