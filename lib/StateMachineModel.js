// StateMachineModel.js
// All rights reserved 2011-2015, StateForge.
// Frederic Heem - frederic.heem@gmail.com

function StateMachineModel() {
    "use strict";
    var _valid = false // is the model valid
    var _states = []
    var _xmlContent; // the content of the state machine in xml
    var _domDocument; // The state machine xml dom document
    var _name;
    var _fileName;
    var $xml // The state machine in jquery
    var _xslDom //the xsl to indent

    this.getXmlContent = function (){
        return _xmlContent
    }

    this.getXml = function () {
        return $xml
    }

    this.isValid = function () {
        return _valid
    }

    this.getStateRoot = function () {
        return $xml.find("state:first")
    }

    this.getName = function () {
        if (_name) {
            return _name
        }
    }

    this.getLanguage = function () {
        var language = ""
        var stateMachineRoot = _domDocument.firstChild;
        if (stateMachineRoot == undefined) {
            throw "Cannot find the root element StateMachine"
        } else {
            var namespace = stateMachineRoot.namespaceURI
            if (namespace.indexOf("DotNet") != 1) {
                language = "dotnet";
            } else if (namespace.indexOf("Cpp") != 1) {
                language = "cpp"
            } else if (namespace.indexOf("Java") != 1) {
                language = "java"
            }
        }
        return language;
    }

    this.setName = function (name) {
        _name = name
    }

    this.setFilename = function (filename) {
        _fileName = filename
    }

    this.getStateName = function ($state) {
        var stateName = $state.attr("name")
        if (stateName) {
            return stateName
        } else {
            throw "State must have the name attribute"
        }
    }

    this.setStateName = function ($state, name) {
        $state.attr("name", name)
    }

    this.stateRename = function (nameOld, nameNew) {
        var $stateOld = this._getState(nameOld)
        $stateOld.attr("name", nameNew)

        var $transitions = this.getTransitionPointingToState(nameOld)
        $transitions.attr("nextState", nameNew)
    }

    this.getTransitionPointingToState = function (stateName) {
        var $transitions = $xml.find("transition[nextState=" + stateName + "]")
        return $transitions
    }

    this.getStateKind = function (stateName) {
        var $state = this._getState(stateName)
        var kind = $state.attr("kind")
        return kind
    }

    this.setStateKind = function (stateName, kind) {
        var $state = this._getState(stateName)
        if (kind && kind != "Leaf") {
            $state.attr("kind", kind)
        } else {
            $state.removeAttr("kind")
        }
    }

    this.getState = function (stateName) {
        var $state = $xml.find("state[name=" + stateName + "]")
        // TODO Check for duplicated state name
        return $state
    }

    this.hasState = function (stateName) {
        if (this.getState(stateName).size() == 0) {
            return false
        } else {
            return true
        }
    }

    this._getEventId = function (eventId) {
        var $eventId = $xml.find("event[id=" + eventId + "],timer[id=" + eventId + "]")
        return $eventId
    }

    this.hasEventId = function (eventId) {
        if (this._getEventId(eventId).size() == 0) {
            return false
        } else {
            return true
        }
    }

    this._getEventName = function (eventName) {
        var $eventName = $xml.find("event[name=" + eventName + "],timer[name=" + eventName + "]")
        return $eventName
    }

    this.hasEventName = function (eventName) {
        if (this._getEventName(eventName).size() == 0) {
            return false
        } else {
            return true
        }
    }

    this.getEventIdList = function () {
        var eventIdList = []
        $xml.find("event[id],timer[id]").each(function () {
            eventIdList.push($(this).attr("id"))
        })

        return eventIdList
    }

    this.getTimerNameList = function () {
        var timerNameList = []
        $xml.find("timer[name]").each(function () {
            timerNameList.push($(this).attr("name"))
        })

        return timerNameList;
    }

    this.getStateNameList = function () {
        var stateNameList = []
        this.getStateRoot().find("state[name]").each(function () {
            stateNameList.push($(this).attr("name"))
        })

        return stateNameList;
    }

    this.getNextStateNameList = function (stateName) {
        var stateNameList = []
        this._getNextStateAll(_states[stateName].context, stateNameList)
        return stateNameList
    }

    this._getNextStateAll = function (context, stateNameList) {
        if (context) {
            var states = context.states
            for (var stateName in states) {
                if (this.isStateRoot(stateName) == false) {
                    stateNameList.push(stateName)
                }
            }
            this._getNextStateAll(context.parent, stateNameList)
        }
    }

    this.getTransitionNextState = function ($transition) {
        return $transition.attr("nextState")
    }

    this.getTransitionEvent = function ($transition) {
        var event = $transition.attr("event")
        //TODO check empty event
        return event
    }

    this.getTransitionName = function ($transition) {
        var transitionName;
        var condition = this.getCondition($transition);
        if (condition) {
            transitionName = this.getTransitionEvent($transition) + "[<span class=\"actionContent\">" + condition + "</span>]";
        } else {
            transitionName = this.getTransitionEvent($transition);
        }
        return transitionName;
    }


    this.getCondition = function ($transition) {
        var conditionAttribute = $transition.attr("condition")
        if (conditionAttribute) {
            return conditionAttribute
        }

        var conditionElement = $transition.children("condition:first").text()
        if (conditionElement != "") {
            return conditionElement
        }

        // No Condition in transition
        return null;
    }

    this.getChildList = function ($state) {
        return $state.children("state")
    }

    this.hasChild = function (stateName) {
        return this.getState(stateName).children("state,parallel").size() > 0 ? true : false
    }

    this.getParallel = function (stateName) {
        return this.getState(stateName).children("parallel:first")
    }

    this.getParallelNextState = function ($parallel) {
        return $parallel.attr("nextState")
    }

    this.hasParallel = function (stateName) {
        return this.getState(stateName).children("parallel:first").size() > 0 ? true : false
    }

    this.getTransitionList = function ($state) {
        return $state.children("transition")
    }

    this.getTransition = function (stateName, transitionIndex) {
        return this.getState(stateName).children("transition:eq(" + transitionIndex + ")")
    }

    this.getOnEntry = function ($state) {
        return $state.children("onEntry:first")
    }

    this.getOnExit = function ($state) {
        return $state.children("onExit:first")
    }

    this.getTimerName = function ($timerTag) {
        return $timerTag.attr("timer")
    }

    this.getActionInAttribute = function ($node) {
        var actionInAttribute = $node.attr("action")
        return actionInAttribute
    }

    this.hasActionInAttribute = function ($node) {
        var found = false
        $node.each(function () {
            if ($(this).attr("action")) {
                found = true
            }
        })

        return found
    }

    this.hasStateAction = function ($state) {
        var $transitions = $state.children("transition")
        return this.hasAction($transitions)
    }

    this.hasAction = function ($node) {
        if (this.hasActionInAttribute($node)) {
            return true
        }

        if ($node.children("action,timerStart,timerStop").size() > 0) {
            return true
        } else {
            return false
        }
    }

    this._hasTransition = function ($state) {
        if ($state.children("transition").size() > 0) {
            return true
        } else {
            return false
        }
    }

    //////////////////////
    // Xml and Dom
    /////////////////////
    this.xmlToDom = function (xml) {
        _valid = false
        if (xml == undefined) {
            return
        }

        try {
            $('#XmlErrors').children().remove()
            _domDocument = jQuery.parseXML(xml)
            $xml = $(_domDocument)
            _xmlContent = xml
        } catch (e) {
            //$('#XmlErrors').append('<p>error parsing string 2: error.name=' + e.name + ' error.message=' + e.message + '</p>');
            throw "Error parsing state machine"
        }

        //        try {
        //            if (window.ActiveXObject) {
        //                _domDocument = new ActiveXObject('Microsoft.XMLDOM');
        //                _domDocument.loadXML(xml);
        //            } else if (window.DOMParser) {
        //                _domDocument = new DOMParser().parseFromString(xml, 'text/xml');
        //            } else {
        //                throw new Error('No XML parser available');
        //            }
        //        } catch (e) {

        //            alert("dom parsing string 2: error.name=" + e.name + " error.message=" + e.message)
        //        }
        return _parse($xml)
    }

    this.domToXml = function () {
        if ($xml == undefined) {
            return
        }

        var domNotPretty = $xml.context
        var serializer
        if (typeof XSLTProcessor != "undefined") {
            // code for Mozilla, Firefox, Opera, etc.
            var xsltProcessor = new XSLTProcessor();
            if (_xslDom == undefined) {
                _xslDom = this.loadXMLDoc("indent.xsl")
            }
            xsltProcessor.importStylesheet(_xslDom);
            var domPretty = xsltProcessor.transformToDocument(domNotPretty);
            serializer = new XMLSerializer();
            _xmlContent = serializer.serializeToString(domPretty);
        } else if (window.ActiveXObject) {
            var xslt = new ActiveXObject("Msxml2.XSLTemplate");
            var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");

            if (_xslDom == undefined) {
                _xslDom = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
                _xslDom.async = false;
                _xslDom.load("indent.xsl");
                if (_xslDom.parseError.errorCode != 0) {
                    var myErr = xmlDoc.parseError;
                    //("Error parsinf xsl for indenting, error " + myErr.reason);
                    return;
                }
            }

            xslt.stylesheet = _xslDom;
            var xslProc = xslt.createProcessor();
            xslProc.input = domNotPretty;
            xslProc.transform();
            _xmlContent = xslProc.output
        } else if (stateEditorMainWindow) {
            var serializer = new XMLSerializer();
            _xmlContent = stateEditorMainWindow.indentXml(serializer.serializeToString(domNotPretty))
        } else {
            // Fallback
            var serializer = new XMLSerializer();
            _xmlContent = serializer.serializeToString(domNotPretty);
        }

        this.xmlToDom(_xmlContent)

        return _xmlContent;
    }

    this.loadXMLDoc = function (dname) {
        var xhttp
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        }
        else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.open("GET", dname, false);
        xhttp.send("");
        return xhttp.responseXML;
    }

    /////////////////
    // Parsing
    /////////////////
    function _parse($xml) {
        //alert(_domDocument.documentElement.localName)
        var $stateMachine = $xml.children()
        if ($stateMachine.size() != 1) {
            throw "Unable to find the root node sm:StateMachine, check the input file"
        }

        _parseSettings($stateMachine)
        _parseStates($stateMachine)
        _valid = true
    }

    function _parseSettings($stateMachine) {
        var $settings = $stateMachine.find("settings").first();
        if ($settings.size() > 0) {
            _parseSettingsAttribute($settings)
            _parseSettingsElement($settings)
        } else {
            throw "settings tag not found"
        }
    }

    function _parseStates($stateMachine) {
        _states = []
        var $stateRoot = $stateMachine.children("state");
        if ($stateRoot.size() == 0) {
            throw "Unable to find the root state"
        } else if ($stateRoot.size() > 1) {
            throw "Only one root state is allowed"
        } else {
            parseState($stateRoot, null, null, new Context(null))
        }
    }

    function parseState($state, $stateParent, $stateParallel, context) {
        var stateName = $state.attr("name")

        var state = _states[stateName]
        if (state) {
            throw "State " + stateName + " already exist";
        }

        _states[stateName] = new State($state, $stateParent, $stateParallel, context)

        var $parallel = $state.children("parallel").first()
        if ($parallel.size() == 0) {
            $state.children("state").each(function () {
                parseState($(this), $state, $stateParallel, context)
            })
        } else {
            $parallel.children("state").each(function () {
                var contextSub = new Context(context)
                parseState($(this), null, $state, contextSub)
            })
        }
    }

    function _parseSettingsAttribute($settings) {
        var name = $settings.attr("name")
        if (name) {
            this.setName(name)
        }
    }

    function _parseSettingsElement(settings) {

    }

    this.getFirstElement = function ($node, elementName) {
        return $node.children(elementName + ":first")
    }

    //////////////
    // State
    //////////////
    this.isStateRoot = function (stateName) {
        var $stateRoot = this.getStateRoot()
        if ($stateRoot.attr("name") == stateName) {
            return true
        } else {
            return false
        }
    }

    this.isStateComposite = function (stateName) {
        var $state = this._getState(stateName)
        if ($state.children("state").size() == 0) {
            return false;
        } else {
            return true
        }
    }

    this.stateRemove = function (stateName) {
        var $state = this._getState(stateName)
        if (this.isStateRoot(stateName) == false) {
            $state.remove()
        }
    }

    this.stateAdd = function (stateNameCurrent, name, kind, where) {
        var $stateCurrent = this._getState(stateNameCurrent)
        var stateNew = _domDocument.createElement("state");
        this.setStateName($(stateNew), name)
        this.setStateKind(name, kind)

        if (where == "before") {
            $stateCurrent.before(stateNew)
        } else if (where == "below") {
            $stateCurrent.append(stateNew)
        } else {
            $stateCurrent.after(stateNew)
        }
    }

    this.stateCopy = function (stateName) {
        var $state = this._getState(stateName)
        return $state.clone()
    }

    this.statePaste = function (stateName, pasteAs, $copiedState) {
        if ($copiedState == undefined) {
            return;
        }
        var $state = this._getState(stateName)
        if (pasteAs == "before") {
            $copiedState.insertBefore($state)
        } else if (pasteAs == "after") {
            $copiedState.insertAfter($state)
        } else if (pasteAs == "asChild") {
            $state.append($copiedState)
        }
    }

    this.stateActionPaste = function (stateName, actionContainerName, $copiedAction) {
        if ($copiedAction == undefined) {
            return
        }

        var $actionContainer = this.getActionContainer(stateName, actionContainerName, 0)
        if ($actionContainer.size() == 0) {
            $actionContainer = this.newActionContainer(stateName, actionContainerName, 0)
        }

        $actionContainer.append($copiedAction)
    }

    /////////////
    // Action
    /////////////
    this.removeActionContainer = function (stateName, actionContainer) {
        var $stateName = this._getState(stateName)
        $stateName.children(actionContainer).remove()
    }

    /////////////
    // Action
    /////////////
    this.addCode = function (stateName, actionContainerName, actionContainerIndex, actionContent, actionIndex) {
        if (actionContent == "") {
            return
        }
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        if ($actionContainer.size() == 0) {
            $actionContainer = this.newActionContainer(stateName, actionContainerName, actionContainerIndex)
        }
        var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        var actionNew = _domDocument.createElement("action");
        $(actionNew).text(actionContent)
        if ($action.size() == 0) {
            $actionContainer.append(actionNew)
        } else {
            $(actionNew).insertAfter($action)
        }
    }

    this.codeGet = function (stateName, actionContainerName, actionContainerIndex, actionIndex, attribute) {
        if (attribute == "true") {
            var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
            return $actionContainer.attr("action")
        } else {
            var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
            return $action.text()
        }
    }

    this.actionCopy = function (stateName, actionContainerName, actionContainerIndex, actionIndex, attribute) {
        var $action
        if (attribute == "true") {
            var actionContent = this.codeGet(stateName, actionContainerName, actionContainerIndex, actionIndex, attribute)
            var action = _domDocument.createElement("action");
            $(action).text(actionContent)
            return $(action)
        } else {
            var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
            $action = $actionContainer.children(":eq(" + actionIndex + ")")
            return $action.clone()
        }
    }

    this.actionPaste = function (stateName, actionContainerName, actionContainerIndex, actionIndex, below, $actionToCopy) {
        if ($actionToCopy == undefined || $actionToCopy.size() == 0) {
            return
        }
        var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        if ($action.size() == 0) {
            var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
            $actionContainer.append($actionToCopy)
        } else if (below == true) {
            $actionToCopy.insertAfter($action)
        } else {
            $actionToCopy.insertBefore($action)
        }
    }

    this.editCode = function (stateName, actionContainerName, actionContainerIndex, actionContent, actionIndex, attribute) {
        if (attribute == "true") {
            var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
            $actionContainer.attr("action", actionContent)
        } else {
            var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
            $action.text(actionContent)
        }
    }


    this.actionRemove = function (stateName, actionContainerName, actionContainerIndex, actionIndex, attribute) {
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        if ($actionContainer.size() == 0) {
            return;
        }

        if (attribute == "true") {
            $actionContainer.removeAttr("action")
        } else {
            var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
            $action.remove()
        }
        //TODO test that
        if (actionContainerName != "transition") {
            if (this.hasAction($actionContainer) == false) {
                $actionContainer.remove()
            }
        }
    }

    ///////////////
    // TimerStart
    ///////////////
    this.timerStartAdd = function (stateName, actionContainerName, actionContainerIndex, actionIndex, timerName, timerDuration) {
        if (timerDuration == "") {
            return
        }
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        if ($actionContainer.size() == 0) {
            $actionContainer = this.newActionContainer(stateName, actionContainerName, actionContainerIndex)
        }

        var timerStart = _domDocument.createElement('timerStart');
        timerStart.setAttribute("timer", timerName)
        timerStart.setAttribute("duration", timerDuration)

        var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)

        if ($action.size() == 0) {
            $actionContainer.append(timerStart)
        } else {
            $(timerStart).insertAfter($action)
        }
    }

    this.timerStartEdit = function (stateName, actionContainerName, actionContainerIndex, actionIndex, timerName, timerDuration) {
        var $timerStart = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        $timerStart.attr("timer", timerName)
        $timerStart.attr("duration", timerDuration)
    }

    this.timerStartGetName = function (stateName, actionContainerName, actionContainerIndex, actionIndex) {
        var $timerStart = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        return $timerStart.attr("timer")
    }

    this.timerGetDuration = function (stateName, actionContainerName, actionContainerIndex, actionIndex) {
        var $timerStart = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        return $timerStart.attr("duration")
    }

    ///////////////
    // TimerStop
    ///////////////

    this.timerStopAdd = function (stateName, actionContainerName, actionContainerIndex, actionIndex, timerName) {
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        if ($actionContainer.size() == 0) {
            $actionContainer = this.newActionContainer(stateName, actionContainerName, actionContainerIndex)
        }

        var timerStop = _domDocument.createElement('timerStop');
        timerStop.setAttribute("timer", timerName)

        var $action = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)

        if ($action.size() == 0) {
            $actionContainer.append(timerStop)
        } else {
            $(timerStop).insertAfter($action)
        }
    }

    this.timerStopEdit = function (stateName, actionContainerName, actionContainerIndex, actionIndex, timerName) {
        var $timerStop = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        $timerStop.attr("timer", timerName)
    }

    this.timerStopGetName = function (stateName, actionContainerName, actionContainerIndex, actionIndex) {
        var $timerStop = this.getAction(stateName, actionContainerName, actionContainerIndex, actionIndex)
        return $timerStop.attr("timer")
    }

    //////////////
    // Transition
    //////////////
    this.getTransitionCount = function (stateName) {
        var $state = this._getState(stateName)
        var count = $state.children("transition").size()
        return count
    }

    this.transitionAdd = function (stateName, transitionIndex, event, condition, nextState) {
        var $state = this._getState(stateName)

        var transition = _domDocument.createElement('transition');
        transition.setAttribute("event", event)

        if (condition != "") {
            transition.setAttribute("condition", condition)
        } else {
            transition.removeAttribute("condition")
        }

        if (nextState != "") {
            transition.setAttribute("nextState", nextState)
        } else {
            transition.removeAttribute("nextState")
        }

        var $transitionCurrent = $state.children("transition:eq(" + transitionIndex + ")")

        if ($transitionCurrent.size() == 1) {
            $transitionCurrent.after($(transition))
        } else {
            var $stateChildFirst = $state.children("state:first")
            if ($stateChildFirst.size() == 0) {
                $state.append($(transition))
            } else {
                $(transition).insertBefore($stateChildFirst)
            }
        }
    }

    this.transitionEdit = function (stateName, transitionIndex, event, condition, nextState) {
        var $transition = this.getActionContainer(stateName, "transition", transitionIndex)

        $transition.attr("event", event)

        if (condition != "") {
            $transition.attr("condition", condition)
        } else {
            $transition.removeAttr("condition")
        }

        //TODO internal next state
        if (nextState != "") {
            $transition.attr("nextState", nextState)
        } else {
            $transition.removeAttr("nextState")
        }
    }

    this.transitionRemove = function (stateName, transitionIndex) {
        var $transition = this.getActionContainer(stateName, "transition", transitionIndex)
        $transition.remove()
    }

    this.transitionCopy = function (stateName, transitionIndex) {
        var $actionContainer = this.getActionContainer(stateName, "transition", transitionIndex)
        return $actionContainer.clone()
    }

    this.transitionPaste = function (stateName, transitionIndex, below, $copiedTransition) {
        if ($copiedTransition == undefined || $copiedTransition.size() == 0) {
            return
        }

        var $actionContainer = this.getActionContainer(stateName, "transition", transitionIndex)
        if ($actionContainer.size() == 0) {
            var $state = this._getState(stateName)
            $state.append($copiedTransition)
        } else if (below == true) {
            $copiedTransition.insertAfter($actionContainer)
        } else {
            $copiedTransition.insertBefore($actionContainer)
        }
    }

    /////////////////
    // Utils
    /////////////////

    this._getState = function (stateName) {
        return $xml.find("state[ name = " + stateName + " ]");
    }

    this.getActionContainer = function (stateName, actionContainerName, actionContainerIndex) {
        var $state = this._getState(stateName)
        var $actionContainer = $state.children(actionContainerName + ":eq(" + actionContainerIndex + ")")
        return $actionContainer
    }

    this.newActionContainer = function (stateName, actionContainerName, actionContainerIndex) {
        var actionContainerNew = _domDocument.createElement(actionContainerName);
        var $stateCurrent = this._getState(stateName)
        if (actionContainerName == "onEntry") {
            $stateCurrent.prepend(actionContainerNew)
        } else if (actionContainerName == "onExit") {
            var $onEntry = $stateCurrent.children("onEntry").last()
            if ($onEntry.size() > 0) {
                $onEntry.after(actionContainerNew)
            } else {
                $stateCurrent.prepend(actionContainerNew)
            }
        } else if (actionContainerName == "transition") {
            $stateCurrent.append(actionContainerNew)
        }

        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)

        return $actionContainer
    }

    this.getAction = function (stateName, actionContainerName, actionContainerIndex, actionIndex) {
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        var $action = $actionContainer.children(":eq(" + actionIndex + ")")
        return $action
    }

    this._getTimerStart = function (stateName, actionContainerName, actionContainerIndex, actionIndex) {
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        $timerStart = $actionContainer.children("timerStart:eq(" + actionIndex + ")")
        return $timerStart
    }

    this._getTimerStop = function (stateName, actionContainerName, actionContainerIndex, actionIndex) {
        var $actionContainer = this.getActionContainer(stateName, actionContainerName, actionContainerIndex)
        $timerStop = $actionContainer.children("timerStop:eq(" + actionIndex + ")")
        return $timerStop
    }

    ////////////////
    // Events
    ////////////////
    this.eventAdd = function (eventSourceName, eventType, eventId, params, eventName, preAction, postAction, eventIdCurrent) {
        var $eventSource = this.getEventSource(eventSourceName)
        if ($eventSource.size() == 0) {
        // TODO Create event source
            return
        }

        var $eventCurrent = this.getEvent(eventIdCurrent)
        var $eventNew = $(_domDocument.createElement(eventType));
        this.setEventParams($eventNew, params)
        this.setEventPreAction($eventNew, preAction)
        this.setEventPostAction($eventNew, postAction)
        $eventNew.attr("id", eventId)
        if (eventName != "") {
            $eventNew.attr("name", eventName)
        }

        if ($eventCurrent.size() == 0) {
            $eventSource.prepend($eventNew)
        } else {
            $eventNew.insertAfter($eventCurrent)
        }

        return $eventNew
    }

    this.eventEdit = function (eventSourceName, eventType, eventIdUpdated, params, eventName, preAction, postAction, eventIdCurrent) {
        var $eventNew = this.eventAdd(eventSourceName, eventType, eventIdUpdated, params, eventName, preAction, postAction, eventIdCurrent)
        $eventNew.prev().remove()

        var $transitions = $xml.find("transition[event=" + eventIdCurrent + "]")
        $transitions.attr("event", eventIdUpdated)
    }

    this.eventSourceAdd = function (eventSourceNameCurrent, eventSourceName) {
        var $eventSource = this.getEventSource(eventSourceName)
        if ($eventSource.size() != 0) {
            //TODO
            return
        }

        var $eventSource = $(_domDocument.createElement("eventSource"));
        $eventSource.attr("name", eventSourceName)

        var $eventSourceCurrent = this.getEventSource(eventSourceNameCurrent)
        if ($eventSourceCurrent.size() == 0) {
            var $events = this.getEvents()
            $events.prepend($eventSource)
        } else {
            $eventSource.insertAfter($eventSourceCurrent)
        }

        this.eventAdd(eventSourceName, "event", "eventToEdit", "", "", "")
    }

    this.eventSourceEdit = function (eventSourceOld, eventSourceNameNew) {
        var $eventSource = this.getEventSource(eventSourceOld)
        $eventSource.attr("name", eventSourceNameNew);
    }

    this.setEventParams = function ($event, params) {
        $event.children("parameter").remove()
        if (params == "") {
            return
        }
        var paramsArray = params.split(',')
        for (var i = 0; i < paramsArray.length; i++) {
            var parameterDom = _domDocument.createElement("parameter");
            var param = paramsArray[i]
            var paramArray = param.match(/(\S+)\s(\S+)/)
            if (paramArray) {
                var type = paramArray[1]
                var name = paramArray[2]

                $(parameterDom).attr("name", name)
                var indexOfReference = type.indexOf("&")
                var indexOfPointer = type.indexOf("*")
                if (indexOfReference > 0) {
                    type = type.substring(0, indexOfReference)
                    $(parameterDom).attr("type", type)
                    $(parameterDom).attr("passedBy", "reference")
                } else if (indexOfPointer > 0) {
                    type = type.substring(0, indexOfPointer)
                    $(parameterDom).attr("type", type)
                    $(parameterDom).attr("passedBy", "pointer")
                } else {
                    $(parameterDom).attr("type", type)
                }

                $event.append($(parameterDom))
            }
        }
    }

    this.removeSpace = function (string) {
        return string.replace("/ /g", "")
    }

    //Event operations
    this.eventRemove = function (eventId) {
        var $event = this.getEvent(eventId)
        $event.remove()
    }

    this.eventCopy = function (eventId) {
        var $event = this.getEvent(eventId)
        return $event.clone()
    }

    this.eventPaste = function (eventId, below, $eventToCopy) {
        if (($eventToCopy == undefined) || ($eventToCopy.size() == 0)) {
            return
        }

        var $event = this.getEvent(eventId)
        if ($event.size() == 0) {
            var eventSourceName = this.getEventSourceFromEventId(eventId)
            var $eventSource = this.getEventSource(eventSourceName)
            $eventSource.append($eventToCopy)
        } else if (below == true) {
            $eventToCopy.insertAfter($event)
        } else {
            $eventToCopy.insertBefore($event)
        }
    }

    //
    //EventSource operations
    //
    this.eventSourceRemove = function (eventSourceName) {
        var $eventSource = this.getEventSource(eventSourceName)
        $eventSource.remove()
    }

    this.eventSourceCopy = function (eventSourceName) {
        var $eventSource = this.getEventSource(eventSourceName)
        return $eventSource.clone()
    }

    this.eventSourcePaste = function (eventSourceName, below, $eventSourceToCopy) {
        if (($eventSourceToCopy == undefined) || ($eventSourceToCopy.size() == 0)) {
            return
        }

        var $eventSource = this.getEventSource(eventSourceName)
        if ($eventSource.size() == 0) {
            var $events = this.getEvents(eventSourceName)
            $events.append($eventSourceToCopy)
        } else if (below == true) {
            $eventSourceToCopy.insertAfter($eventSource)
        } else {
            $eventSourceToCopy.insertBefore($eventSource)
        }
    }

    //Event common ops
    this.getEvents = function () {
        return $xml.find("events");
    }

    this.getEventSourceFromEventId = function (eventId) {
        var $event = this.getEvent(eventId)
        var eventSourceName = $event.parent().attr("name")
        return eventSourceName
    }

    this.getEventSource = function (eventSourceName) {
        if (eventSourceName && eventSourceName != "") {
            return $xml.find("eventSource[name=" + eventSourceName + "]")
        } else {
            return $xml.find("eventSource:first")
        }
    }

    this.hasEventSource = function (eventSourceName) {
        if ($xml.find("eventSource[name=" + eventSourceName + "]").size() > 0){
            return true
        } else {
            return false
        }
    }

    this.getEvent = function (eventId) {
        return $xml.find("event[id=" + eventId + "],timer[id=" + eventId + "]")
    }

    this.getEventCount = function (eventSourceName) {
        var eventSource = this.getEventSource(eventSourceName);
        var eventCount = $(eventSource).children().length
        return eventCount;
    }

    this.getEventType = function (eventId) {
        return this.getEvent(eventId).get(0).nodeName
    }

    this.getEventId = function ($event) {
        return $event.attr("id")
    }

    this.getEventName = function (eventId) {
        return this.getEvent(eventId).attr("name")
    }

    this.getEventParams = function (eventId) {
        var params = ""
        var $params = this.getEvent(eventId).children("parameter")
        $params.each(function (i) {
            var passedByValue = $(this).attr("passedBy")
            var passedBy = ""
            if (passedByValue == "reference") {
                passedBy = "&"
            } else if (passedByValue == "pointer") {
                passedBy = "*"
            }
            var param = $(this).attr("type") + passedBy + " " + $(this).attr("name")
            params = params + param
            if (i + 1 < $params.size()) {
                params = params + ", "
            }
        })
        return params
    }

    this.getEventPreAction = function (eventId) {
        return this.getEvent(eventId).attr("preAction")
    }

    this.setEventPreAction = function ($eventId, preAction) {
        if (preAction != "") {
            $eventId.attr("preAction", preAction);
        } else {
            $eventId.removeAttr("preAction");
        }
    }

    this.getEventPostAction = function (eventId) {
        return this.getEvent(eventId).attr("postAction")
    }

    this.setEventPostAction = function ($eventId, postAction) {
        if (postAction != "") {
            $eventId.attr("postAction", postAction);
        } else {
            $eventId.removeAttr("postAction");
        }
    }

    ////////////////
    // Parallel
    ////////////////
    this.parallelAdd = function (stateName, parallelCount, nextState) {
        if (this.hasChild(stateName) == true) {
            return
        }

        var $state = this._getState(stateName)
        var $parallel = $(_domDocument.createElement("parallel"));
        $parallel.appendTo($state)
        if (nextState) {
            $parallel.attr("nextState", nextState)
            if (this.hasState(nextState) == false) {
                this.createState(stateName, nextState)
            }
        }

        for (i = 0; i < parallelCount; i++) {
            var $stateOrthognal = $(_domDocument.createElement("state"))
            $stateOrthognal.attr("name", "S" + i).appendTo($parallel)
            var $stateInit = $(_domDocument.createElement("state"))
            $stateInit.attr("name", "SInit" + i).appendTo($stateOrthognal)
            var $stateEnd = $(_domDocument.createElement("state"))
            $stateEnd.attr("name", "SEnd" + i).attr("kind", "final").appendTo($stateOrthognal)
        }
    }

    this.parallelEdit = function (stateName, nextState) {
        if (this.hasParallel(stateName) == false) {
            return
        }

        var $parallel = this.getParallel(stateName)
        $parallel.attr("nextState", nextState)
    }

    this.parallelGetNextState = function (stateName) {
        if (this.hasParallel(stateName) == false) {
            return ""
        }

        return this.getParallel(stateName).attr("nextState")
    }

    this.parallelRemove = function (stateName) {
        this.getParallel(stateName).remove()
    }

    this.createState = function (stateName, newState) {
        $nextState = $(_domDocument.createElement("state"))
        $nextState.attr("name", newState)
        this.getState(stateName).after($nextState)
    }
}

function State($state, $stateParent, $stateParallel, context) {
    this.$state = $state
    this.$stateParent = $stateParent
    this.$stateParallel = $stateParallel
    this.context = context
    context.addState($state.attr("name"), $state)
}

function Context(contextParent) {
    this.states = []
    this.parent = contextParent

    this.addState = function (stateName, $state) {
        this.states[stateName] = $state
    }
}

module.exports = StateMachineModel;