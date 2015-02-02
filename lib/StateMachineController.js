// StateMachineDiagram.js
// All rights reserved 2011-2015, StateForge.
// Frederic Heem - frederic.heem@gmail.com

var stateEditorMainWindow;
var stateMachineController;

var StateMachineView = require('./StateMachineView.js')
var StateMachineModel = require('./StateMachineModel.js')

function StateMachineController() {
    "use strict";
    var model;
    var view;
    var viewCurrentState;
    var viewCurrentParallel;
    var stateNameCurrent;
    var viewCurrentAction;
    var viewCurrentTransition;
    var viewCurrentEvent;
    var $copiedState;
    var $copiedTransition;
    var $copiedAction;
    var $copiedEvent;
    var $copiedEventSource;
    var tabView;
    var editor;
    var tabCurrentName;
    var _actionContainer;
    var _actionType;
    var _command;
    var _eventIdCurrent;
    var _eventSourceCurrent;
    var _eventNameCurrent;
    var textEnterStateName = "Enter state name";
    var apiFile = false;
    var stackStateMachine = [];
    var stackStateMachineRedo = [];
    var _from;
    var editorApiWriting;

    this.init = function (from) {
        _from = from
        checkFileApi()
        view = new StateMachineView()
        tabViewInit()

        initToolBar()
        initButtonTheme()
        initDiagram()
    }

    function initTabEvents() {

        $("thead").each(function () {
            $(this).addClass("ui-widget-header");
        });

        $(".stateTitle").each(function () {
            $(this).addClass("ui-widget-header ui-widget-content");
        });

        $(".dd-header").each(function () {
            $(this).addClass("ui-widget-header");
        });

        $(".entryExitTable").each(function () {
            $(this).addClass("ui-widget-content");
        });

        $(".State,.StateRoot,.StateOrthogonal").each(function () {
            $(this).addClass("ui-widget ui-widget-content");
        });

        $("#StateMachineDiagram table th,  #TableEventContainer table th").each(function () {
            $(this).addClass("ui-state-default");
        });

        $("#StateMachineDiagram tr").each(function () {
            $(this).addClass("ui-widget-content");
        });

        $(".StateRoot").removeClass("ui-corner-all");

        $(".StateHistory,.StateFinal").addClass("ui-corner-all");

        $("#TabView").children("ul").removeClass("ui-corner-all");
        $(".ui-tabs-nav").children("li").removeClass("ui-corner-top");
        $(".stateTitle").hover(
            function () {
                $(this).addClass("ui-state-highlight");
            },
            function () {
                $(this).removeClass("ui-state-highlight");
            }
        );

        $(".stateTitle").hover(
            function () {
                var $transition = view.getTransitionPointingToState($(this))
                $transition.addClass("ui-state-highlight");
            },
            function () {
                var $transition = view.getTransitionPointingToState($(this))
                $transition.removeClass("ui-state-highlight");
            }
        );

        $(".transition,.parallelTr").hover(
            function () {
                var nextstateName = $(this).children(".transitionNextState,.parallelNextStateName").text()
                var $nextState = $("#" + nextstateName)
                $nextState.addClass("ui-state-highlight");
                $nextState.children(".stateTitle").addClass("ui-state-highlight");
            },
            function () {
                var nextstateName = $(this).children(".transitionNextState,.parallelNextStateName").text()
                var $nextState = $("#" + nextstateName)
                $nextState.removeClass("ui-state-highlight");
                $nextState.children(".stateTitle").removeClass("ui-state-highlight");
            }
        );

        $(".transition,.Entry,.parallelTr").hover(
            function () {
                $(this).children("td").addClass("ui-state-highlight");
            },
            function () {
                $(this).children("td").removeClass("ui-state-highlight");
            }
        );

        $(".event").hover(
            function () {
                $(this).parent().children("td").addClass("ui-state-highlight");
            },
            function () {
                $(this).parent().children("td").removeClass("ui-state-highlight");
            }
        );        

    }

    function initButtonTheme() {
        $("#switcher").children().remove()
        $("#switcher").button()

        $("#switcher").themeswitcher({
            imgpath: "images/",
            loadTheme: "cupertino"
        });

        $("#switcher").children("span:first").remove()

        $("#switcher").children("a").addClass("ui-button-text")
        $("#switcher").children("div").addClass("ui-widget ui-widget-content")
        $('.jquery-ui-switcher-link').attr("style", "")
        $('.jquery-ui-switcher-title').attr("style", "")
        $('.jquery-ui-switcher-arrow').attr("style", "")
    }

    function initToolBar() {
        $(".Undo").button().click(diagramUndo)
        $(".Redo").button().click(diagramRedo)
    }

    function diagramUndo() {
        var xmlCurrent = stackStateMachine.pop()
        if (xmlCurrent) {
            stackStateMachineRedo.push(xmlCurrent)
        }

        var xmlPrevious = stackStateMachine[stackStateMachine.length - 1]
        if (xmlPrevious) {
            model = new StateMachineModel()
            model.xmlToDom(xmlPrevious)
            viewStateBuild()
            viewEventBuild()
        }
    }

    function diagramRedo() {
        var xmlPrevious = stackStateMachineRedo.pop()
        if (xmlPrevious) {
            stackStateMachine.push(xmlPrevious)
            model = new StateMachineModel()
            model.xmlToDom(xmlPrevious)
            viewStateBuild()
            viewEventBuild()
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
        tabView.tabs('option', 'selected', 1);
        modelBuild(data)
        viewStateBuild()
    }

    function getFsmFileFromLocalStorage() {
        var stateMachineXmlInCache = localStorageGet('StateMachineXml')
        modelBuild(stateMachineXmlInCache)
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

    function tabViewInit() {
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
            viewStateBuild()
        }

        function handleClickTabEvent(e) {
            if (tabCurrentName == "XmlCode") {
                xmlCodeOnExit()
            }
            
            $("body").css("overflow", "visible")
            tabCurrentName = "Event"
            viewEventBuild()
        }

        function handleClickTabXmlCode() {
            $("body").css("overflow", "hidden")
            tabCurrentName = "XmlCode"
            editorUpdate()
        }

        function tabExit(newTab) {

            if (tabCurrentName == "XmlCode") {
                xmlCodeOnExit()
            }
        }

        function xmlCodeOnExit() {
            editor.getSession().on('change', function () {
            });
            modelBuild(editorGetContent())
        }
    }

    function modelBuild(xmlContent) {
        try {
            if (xmlContent != undefined) {
                stackStateMachine.push(xmlContent)
                model = new StateMachineModel()
                model.xmlToDom(xmlContent)
            }
        } catch (error) {
            $("#StateDiagramError").show()
            $("#StateDiagramErrorMessage").text(error.toString())
        }
    }

    function viewStateBuild() {
        view.resetStateView()
        if (model && model.isValid()) {
            try {
                $("#StateDiagramError").hide()
                view.buildStateView(model)
                diagramBindEvent()
            } catch (error) {
                $("#StateDiagramError").show()
                $("#StateDiagramErrorMessage").text(error.toString())
            }
        }
    }

    function viewEventBuild() {
        view.resetEventView()
        try {
            view.buildEventView(model)
            diagramBindEvent()
        } catch (error) {
            //TODO
        }
    }

    function saveToLocalStorage() {
        if (model.getName()) {
            localStorageSet("StateMachineXml", fsmXml)
        }
    }

    function diagramBindEvent() {
        cursor_wait()
        setTimeout(doDiagramBindEvent, 50)
    }

    function doDiagramBindEvent() {

        initState()
        initTransition()
        initAction()
        initEvent()
        initEventSource()
        initParallelNextState()

        initStateDialog()
        initDialogAction()
        initDialogTransition()
        initDialogEvent()
        initDialogEventSource()
        initTabEvents()

        fillSelect("#SelectEvent", model.getEventIdList())
        fillSelect(".TimerList", model.getTimerNameList())

        $("#SelectEvent").combobox();
        $("#SelectStateNext").combobox();
        $("#SelectParallelAddNextState").combobox();
        $("#SelectParallelEditNextState").combobox();
        cursor_clear()
    }

    /// Parallel next state
    function initParallelNextState() {
        $('.parallelNextState').bind('click', onClickParallelEdit)

        //setCurrentViewState($(this).parent())
    }

    function initDialogAction() {
        createDialog("dialogActionEditCode", "Save", onClickActionSave)
        createDialog("dialogActionEditTimerStart", "Save", onClickActionSave)
        createDialog("dialogActionEditTimerStop", "Save", onClickActionSave)
    }

    function fillSelect(id, list) {
        $(id).empty()
        for (i = 0; i < list.length; i++) {
            var name = list[i];
            $(id).append('<option value="' + name + '">' + name + '</option>');
        }
    }

    function unsetCurrentView() {
        viewCurrentTransition = null
        viewCurrentState = null
        viewCurrentAction = null
        viewCurrentEvent = null
        viewCurrentParallel = null
    }

    function setCurrentViewState(stateView) {
        unsetCurrentView()
        viewCurrentState = stateView
    }

    function getCurrentViewState() {
        return viewCurrentState
    }

    function setCurrentViewParallel(parallelView) {
        unsetCurrentView()
        viewCurrentParallel = parallelView
    }

    function getCurrentViewParallel() {
        return viewCurrentParallel
    }

    function setCurrentViewEvent(eventView) {
        unsetCurrentView()
        viewCurrentEvent = eventView
    }

    function getCurrentViewEvent() {
        return viewCurrentEvent
    }

    function getCurrentStateName() {
        var stateName = "??"
        var actionView = getCurrentViewAction()
        var transitionView = getCurrentViewTransition()
        var stateView = getCurrentViewState()
        var parallelView = getCurrentViewParallel()
        if (actionView) {
            stateView = view.getStateFromAction(actionView)
            stateName = view.getStateName(stateView)
        } else if (transitionView) {
            stateView = view.getStateFromTransition(transitionView)
            stateName = view.getStateName(stateView)
        } else if (stateView) {
            stateName = view.getStateName(stateView)
        } else if (parallelView) {
            stateView = view.getStateFromParallel(parallelView)
            stateName = view.getStateName(stateView)
        }

        return stateName
    }

    function setCurrentViewAction(view) {
        unsetCurrentView()
        viewCurrentAction = view
    }

    function getCurrentViewAction() {
        return viewCurrentAction
    }

    function setCurrentViewTransition(view) {
        unsetCurrentView()
        viewCurrentTransition = view
    }

    function getCurrentViewTransition() {
        if (viewCurrentTransition) {
            return viewCurrentTransition.parentNode
        }
        return null
    }

    function hideToolTip() {
        $('.qtip.ui-tooltip').qtip('hide');
    }

    function saveAndShowStateView() {
        hideToolTip()
        domToXml()
        viewStateBuild()
        saveToLocalStorage()
        modelModified()
    }

    this.setXmlContent = function (xmlContent) {
        onContentReceived(xmlContent)
    }

    this.getXmlContent = function () {
        return model.domToXml()
    }

    function domToXml() {
        var xmlContent = model.domToXml()
        if (xmlContent) {
            stackStateMachine.push(xmlContent)
        }

        return xmlContent
    }

    function saveAndShowEventView() {
        hideToolTip()
        domToXml()
        viewEventBuild()
        saveToLocalStorage()
    }

    function getStateNext(transition) {
        var nextState = "";
        transition.children(".nextState").children("p").each(function () {
            nextState = $(this).text();
        });
        return nextState;
    }

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    function editorShow() {

    }

    /////////////
    /// Editor
    /////////////
    function editorUpdate() {
        codeEditorInit()

        editor.getSession().on('change', function () {
            if ((editorApiWriting == false) && (editorGetContent() != "")) {
                modelModified()
            }
        });

        var xmlContent = domToXml()

        editorSetContent(xmlContent)
        editorResize()
    }

    function editorSetContent(content) {
        if (editor && content) {
            editorApiWriting = true
            editor.getSession().setValue(content)
            editorApiWriting = false
            editor.gotoLine(0);
        }
    }

    function editorGetContent() {
        if (editor) {
            return editor.getSession().getValue()
        } else {
            return ""
        }
    }

    function editorResize() {
        $('#StateMachineEditor').css('width', document.body.clientWidth);
        var height = getDocHeight() - $('.yui-nav').height() - $('#EditorMenuContainer').height();
        $('#StateMachineEditor').css('height', height);
        editor.resize()
    }

    function codeEditorInit() {
        if (editor) {
            return;
        }
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/clouds");
        //TODO
        //var EditSession = require('ace/edit_session').EditSession;

        //var XmlScriptMode = require("ace/mode/xml").Mode;
        //editor.getSession().setMode(new XmlScriptMode());

    }

    function getDocHeight() {
        var D = document;
        return Math.max(D.body.clientHeight, D.documentElement.clientHeight);
    }

    //////////////////////
    // Transition
    //////////////////////

    function createTransitionDrilldown() {
        var content = createDrilldown("Transition")
        return content
    }

    function initTransitionMenuCallback() {
        $('.TransitionAdd').bind('click', onClickTransitionAdd);
        $('.TransitionEdit').bind('click', onClickTransitionEdit);
        $('.TransitionCodeAdd').bind('click', { actionContainer: "transition", actionType: "Code" }, onClickActionAdd);
        $('.TransitionTimerStart').bind('click', { actionContainer: "transition", actionType: "TimerStart" }, onClickActionAdd);
        $('.TransitionTimerStop').bind('click', { actionContainer: "transition", actionType: "TimerStop" }, onClickActionAdd);

        $('.TransitionCut').bind('click', onClickTransitionCut);
        $('.TransitionPasteAbove').bind('click', { below: false }, onClickTransitionPaste);
        $('.TransitionPasteBelow').bind('click', { below: true }, onClickTransitionPaste);
    }

    function initTransition() {
        $('.transitionEventArrow,.transitionEvent,.transitionEventState,.transitionNextState').bind('click', function (event) {
            var content = createTransitionDrilldown()
            setCurrentViewTransition(this)
            createMenu($(this), event, content, "Transition");
            initTransitionMenuCallback()
        });
    }

    function initDialogTransition() {
        createDialog("dialogTransitionEdit", "Save transition", onClickTransitionSave)
    }

    function onClickTransitionEdit(event) {
        event.stopPropagation()
        hideToolTip()

        var stateName = getCurrentStateName()
        var transitionView = getCurrentViewTransition()
        var transitionIndex = $(transitionView).attr("data-transition-index")
        var transition = model.getTransition(stateName, transitionIndex)

        unsetError("#InputSelectEvent")
        unsetError("#InputSelectStateNext")

        $("#InputSelectEvent").val(model.getTransitionEvent(transition))
        $("#TransitionCondition").val(model.getCondition(transition))

        fillSelect('#SelectStateNext', model.getNextStateNameList(stateName))
        $("#SelectStateNext").append($("<option/>").attr("value", "internal transition").text("internal transition"));

        var nextState = model.getTransitionNextState(transition)
        if (nextState == undefined) {
            nextState = "internal transition"
        }

        $("#InputSelectStateNext").val(nextState)

        _command = 'edit'
        $('#dialogTransitionEdit').dialog('option', 'title', "Edit transition for state " + stateName);
        $("#dialogTransitionEdit").dialog('open');
        return false
    }

    function onClickTransitionAdd(event) {
        event.stopPropagation()
        hideToolTip()

        var stateName = getCurrentStateName()
        var transitionView = getCurrentViewTransition()
        var stateView
        if (transitionView) {
            stateView = view.getStateFromTransition(transitionView)
        } else {
            stateView = getCurrentViewState()
        }

        unsetError("#InputSelectEvent")
        unsetError("#InputSelectStateNext")

        $("#TransitionCondition").val("")
        fillSelect('#SelectStateNext', model.getNextStateNameList(stateName))
        $("#SelectStateNext").append($("<option/>").attr("value", "_InternalTransition_").text("internal transition"));
        $("#InputSelectStateNext").val(stateName)

        _command = "add"
        $('#dialogTransitionEdit').dialog('option', 'title', "Add transition for state " + stateName);
        $("#dialogTransitionEdit").dialog('open');
        return false
    }

    function onClickTransitionSave() {
        var command = _command
        var transitionView = getCurrentViewTransition()
        var stateView
        var transitionIndex
        var stateName = getCurrentStateName()

        if (transitionView) {
            stateView = view.getStateFromTransition(transitionView)
            transitionIndex = $(transitionView).attr("data-transition-index")
        } else {
            stateView = getCurrentViewState()
            transitionIndex = model.getTransitionCount(stateName)
        }

        var eventId = $("#InputSelectEvent").val()
        var condition = $("#TransitionCondition").val()
        var nextState = $("#InputSelectStateNext").val()

        var error = false

        if (nextState == "internal transition") {
            nextState = ""
        } else {
            var errorMessage = isValidState(nextState)
            if (errorMessage) {
                error = true
                setError("#InputSelectStateNext", errorMessage)
            } else {
                unsetError("#InputSelectStateNext")
                if (model.hasState(nextState) == false) {
                    model.createState(stateName, nextState)
                }
            }
        }

        var errorEventId = isEventIdValid(eventId)
        if (errorEventId) {
            error = true
            setError("#InputSelectEvent", errorEventId)
        } else {
            unsetError("#InputSelectEvent")
        }

        if (error == false) {
            if (command == "add") {
                model.transitionAdd(stateName, transitionIndex, eventId, condition, nextState)
            } else {
                model.transitionEdit(stateName, transitionIndex, eventId, condition, nextState)
            }

            $("#dialogTransitionEdit").dialog('close')
            saveAndShowStateView()
        }
    }

    function setError(id, message) {
        $(id).addClass("ui-state-error")
        setToolTipError(id, message)
    }

    function unsetError(id) {
        $(id).removeClass("ui-state-error")
    }

    function onClickTransitionCut(evt) {
        var stateName = getCurrentStateName()
        var transitionView = getCurrentViewTransition()
        var stateView = view.getStateFromTransition(transitionView)
        var transitionIndex = $(transitionView).attr("data-transition-index")

        $copiedTransition = model.transitionCopy(stateName, transitionIndex)
        model.transitionRemove(stateName, transitionIndex)
        saveAndShowStateView()
    }

    function onClickTransitionPaste(evt) {
        var below = evt.data.below
        var stateName = getCurrentStateName()
        var transitionView = getCurrentViewTransition()
        var transitionIndex = $(transitionView).attr("data-transition-index")

        model.transitionPaste(stateName, transitionIndex, below, $copiedTransition)
        saveAndShowStateView()
    }

    //////////////////////////
    // State
    //////////////////////////

    function createStateDrillDown(stateName) {
        var drillDownId = "drillDownStateCloned"
        $("#" + drillDownId).remove()

        var content = $(".DrillDownTopContainerState").first().clone()
        content.find(".drillDownState").attr("id", drillDownId)

        var lastContainer = $(".DrillDownTopContainerState").last()
        content.insertAfter(lastContainer)

        if (model.isStateRoot(stateName) == true) {
            $("#" + drillDownId).find(".LiStateCut,.LiStateDelete,.LiStatePasteAfter,.LiStatePasteBefore").remove()
        }

        if (model.hasParallel(stateName) == false) {
            $("#" + drillDownId).find(".LiParallelEdit,.LiParallelRemove").remove()
        }

        if (model.hasChild(stateName) == true) {
            $("#" + drillDownId).find(".LiParallelAdd").remove()
        }

        if ($("#" + drillDownId).find(".LiParallel").find("li").size() == 0) {
            $("#" + drillDownId).find(".LiParallel").remove()
        }

        $("#" + drillDownId).dcDrilldown({
            speed: 'fast',
            saveState: false,
            showCount: false,
            defaultText: "State Operations"
        });

        return content
    }

    function initStateCallback()
    {
        $('.StateAdd').bind('click', onClickStateAdd);
        $('.StateEdit').bind('click', onClickStateEdit);

        $('.StateEntryCodeAdd').bind('click', { actionContainer: "onEntry", actionType: "Code" }, onClickActionAdd);
        $('.StateExitCodeAdd').bind('click', { actionContainer: "onExit", actionType: "Code" }, onClickActionAdd);

        $('.StateEntryTimerStart').bind('click', { actionContainer: "onEntry", actionType: "TimerStart" }, onClickActionAdd);
        $('.StateExitTimerStart').bind('click', { actionContainer: "onExit", actionType: "TimerStart" }, onClickActionAdd);

        $('.StateEntryTimerStop').bind('click', { actionContainer: "onEntry", actionType: "TimerStop" }, onClickActionAdd);
        $('.StateExitTimerStop').bind('click', { actionContainer: "onExit", actionType: "TimerStop" }, onClickActionAdd);

        $('.StateEntryRemove').bind('click', { actionContainer: "onEntry" }, onClickActionContainerRemove);
        $('.StateExitRemove').bind('click', { actionContainer: "onExit" }, onClickActionContainerRemove);

        $('.StateEntryPasteAction').bind('click', { actionContainer: "onEntry" }, onClickStateActionPaste);
        $('.StateExitPasteAction').bind('click', { actionContainer: "onExit" }, onClickStateActionPaste);

        $('.StateTransitionAdd').bind('click', { actionContainer: "transition" }, onClickTransitionAdd);
        $('.StateTransitionsRemove').bind('click', { actionContainer: "transition" }, onClickActionContainerRemove);
        $('.StateTransitionPaste').bind('click', { actionContainer: "transition" }, onClickStateTransitionPaste);

        $('.StateDelete').bind('click', onClickStateDelete);
        $('.StateCut').bind('click', onClickStateCut);
        $('.StatePasteAfter').bind('click', { pasteAs: "after" }, onClickStatePaste);
        $('.StatePasteBefore').bind('click', { pasteAs: "before" }, onClickStatePaste);
        $('.StatePasteAsChild').bind('click', { pasteAs: "asChild" }, onClickStatePaste);

        $('.ParallelAdd').bind('click', onClickParallelAdd);
        $('.ParallelEdit').bind('click', onClickParallelEdit);
        $('.ParallelRemove').bind('click', onClickParallelRemove);
    }

    function initState() {

        $('.stateTitle').bind('click', function (event) {
            $(".DrillDownTopContainerState").css("display", "block")

            var stateName = $(this).text()
            var content = createStateDrillDown(stateName)

            setCurrentViewState($(this).parent())
            createMenu($(this), event, content, "State");

            initStateCallback()
        });
    }

    function createDialog(dialogName, buttonTexta, callbackOk) {
        $("#" + dialogName).dialog("destroy");
        $("#" + dialogName).dialog({
            modal: true,
            autoOpen: false,
            width: "auto",
            buttons: { "Save": { text: buttonTexta,
                    click: callbackOk
                },
                Cancel: function () {
                    $(this).dialog("close");
                }

            },
            close: function () {
                hideToolTip()

            }
        }).unbind('keyup').bind('keyup', function (evt) {
            if (evt.keyCode == '13') {
                evt.stopPropagation()
                callbackOk(evt);
            }
        })
    }

    function initStateDialog() {
        createDialog("dialogStateAdd", "Add state", onClickStateAddSave)
        createDialog("dialogStateEdit", "Save state", onClickStateEditSave)
        createDialog("dialogStateRemove", "Remove state", onClickStateRemoveSave)
        createDialog("dialogParallelAdd", "Add parallel region", onClickParallelAddSave)
        createDialog("dialogParallelEdit", "Save parallel region", onClickParallelEditSave)
    }

    function onClickStateRemoveSave(evt) {
        var stateNameToRemove = getCurrentStateName();
        model.stateRemove(stateNameToRemove)
        $("#dialogStateRemove").dialog('close');
        saveAndShowStateView()
    }

    function onClickStateEdit(evt) {
        hideToolTip()
        var stateName = getCurrentStateName();

        // Set state name and kind for the edit view
        unsetError("#InputStateEdit")
        $("#InputStateEdit").val(stateName)

        if (model.isStateComposite(stateName) == true) {
            $('#SelectStateEditKind').attr('disabled', 'disabled');
            $("#SelectStateEditKind").val("")
        } else {
            $('#SelectStateEditKind').removeAttr('disabled');
            var kind = model.getStateKind(stateName)
            if (kind) {
                $("#SelectStateEditKind").val(kind)
            } else {
                $("#SelectStateEditKind").val("")
            }
        }

        $("#dialogStateEdit").dialog('open');
        return false
    }

    function dialogActionOpen(actionContainer, actionType, command) {
        hideToolTip()
        _actionContainer = actionContainer
        _actionType = actionType
        _command = command
        $("#dialogActionEdit" + actionType).dialog('open');
        return false
    }

    function onClickStateEditSave(evt) {
        hideToolTip()
        var stateName = getCurrentStateName()
        var stateNameNew = $("#InputStateEdit").val()

        var error
        if (stateName != stateNameNew) {
            if (model.hasState(stateNameNew) == true) {
                error = "State already exists"
            } else {
                error = isValidState(stateNameNew)
            }
        } 
        if (error) {
            setError("#InputStateEdit", error)
        } else {
            $("#dialogStateEdit").dialog('close');
            $("#InputStateEdit").qtip("destroy")
            model.stateRename(stateName, stateNameNew)
            model.setStateKind(stateNameNew, $("#SelectStateEditKind").val())
            saveAndShowStateView()
        }
    }

    function onClickStateAdd(evt) {
        var stateName = getCurrentStateName()

        hideToolTip()

        unsetError("#InputStateAddNew")

        $("#InputStateAddNew").val("")
        $("#SelectStateAddNewKind").val("")

        if (model.isStateRoot(stateName) == true) {
            $("#SelectStateAddWhere").val("below")
            $(".LiStateRemove").css("display", "none")
        } else {
            $("#SelectStateAddWhere").val("after")
            $(".LiStateRemove").css("display", "list-item")
        }

        $("#dialogStateAdd").dialog('open');
        return false
    }

    function onClickStateAddSave(evt) {
        hideToolTip()
        var stateNameCurrent = getCurrentStateName()
        var whereToAdd = "after"
        if (model.isStateRoot(stateNameCurrent)) {
            whereToAdd = "below"
        } else {
            whereToAdd = $("#SelectStateAddWhere").val()
        }

        var stateName = $("#InputStateAddNew").val()
        var error;

        if (model.hasState(stateName) == true) {
            error = "State already exists"
        } else { 
            error = isValidState(stateName)
        }
 
        if (error) {
            setError("#InputStateAddNew", error)
        } else {
            $("#dialogStateAdd").dialog('close');
            model.stateAdd(stateNameCurrent, stateName, $("#SelectStateAddNewKind").val(), whereToAdd)
            saveAndShowStateView()
        }
    }

    function setToolTipError(id, error) {
        $(id).qtip({
            content: {
                text: error
            },
            style: {
                classes: 'ui-tooltip-red ui-tooltip-shadow',
                widget: true
            },
            show: {
                event: false, // Don't specify a show event...
                ready: true // ... but show the tooltip when ready
            },
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            hide: {
                event: 'unfocus'
            }
        })
    }

    function onClickActionContainerRemove(evt) {
        var actionContainer = evt.data.actionContainer
        var stateName = getCurrentStateName()
        model.removeActionContainer(stateName, actionContainer)
        saveAndShowStateView()
    }

    function onClickStateDelete(evt) {
        var stateName = getCurrentStateName()
        model.stateRemove(stateName)

        var $transitions = model.getTransitionPointingToState(stateName)
        $transitions.remove()

        saveAndShowStateView()
    }

    function onClickStateCut(evt) {
        var stateName = getCurrentStateName()
        $copiedState = model.stateCopy(stateName)
        model.stateRemove(stateName)
        saveAndShowStateView()
    }

    function onClickStatePaste(evt) {
        var pasteAs = evt.data.pasteAs
        var stateName = getCurrentStateName()
        model.statePaste(stateName, pasteAs, $copiedState)
        saveAndShowStateView()
    }

    function onClickStateActionPaste(evt) {
        var actionContainer = evt.data.actionContainer
        var stateName = getCurrentStateName()

        model.stateActionPaste(stateName, actionContainer, $copiedAction)
        $copiedAction = undefined
        saveAndShowStateView()
    }

    function onClickStateTransitionPaste(evt) {
        var stateName = getCurrentStateName()
        model.transitionPaste(stateName, 0, "below", $copiedTransition)
        $copiedTransition = undefined
        saveAndShowStateView()
    }

    /////////////////////////
    // Action 
    /////////////////////////

    function createActionDrilldown(stateName) {
        var content = createDrilldown("Action")
        return content
    }

    function initActionMenuCallback() {
        $('.CodeAdd').bind('click', { actionContainer: "", actionType: "Code" }, onClickActionAdd);
        $('.TimerStart').bind('click', { actionContainer: "", actionType: "TimerStart" }, onClickActionAdd);
        $('.TimerStop').bind('click', { actionContainer: "", actionType: "TimerStop" }, onClickActionAdd);
        $('.ActionEdit').bind('click', onClickEditAction);
        $('.ActionCut').bind('click', onClickActionCut);
        $('.ActionPasteAbove').bind('click', { below: false }, onClickActionPaste);
        $('.ActionPasteBelow').bind('click', { below: true }, onClickActionPaste);
    }

    function initAction() {
        $('.action').bind('click', function (event) {
            var content = createActionDrilldown()
            setCurrentViewAction(this)
            createMenu($(this), event, content, "Action");
            initActionMenuCallback()
        });
    }

    function onClickActionAdd(evt) {
        var actionContainer = evt.data.actionContainer
        var actionType = evt.data.actionType
        var stateName = getCurrentStateName()

        if (actionType == "Code") {
            $("#InputActionEdit").val("")
            $('#dialogActionEditCode').dialog('option', 'title', "Add code in " + actionContainer + " for state " + stateName);
        } else if (actionType == "TimerStart") {
            $("#TimerDuration").val("")
            $('#dialogActionEditTimerStart').dialog('option', 'title', "Add timerStart in " + actionContainer + " for state " + stateName);
        } else if (actionType == "TimerStop") {
            $('#dialogActionEditTimerStop').dialog('option', 'title', "Add timerStop in " + actionContainer + " for state " + stateName);
        }

        return dialogActionOpen(actionContainer, actionType, "add")
    }

    function onClickEditAction(evt) {
        var stateName = getCurrentStateName()
        var actionView = getCurrentViewAction()
        var stateView = view.getStateFromAction(actionView)
        var actionIndex = $(actionView).attr("data-action-index")
        var actionContainer = $(getCurrentViewAction()).attr("data-action-container")
        var actionContainerIndex = getActionContainerIndex(view, actionContainer, actionView)

        var actionType = $(getCurrentViewAction()).attr("data-action-type")
        if (actionType == "code") {
            var attribute = $(getCurrentViewAction()).attr("data-action-attribute")
            var code = model.codeGet(stateName, actionContainer, actionContainerIndex, actionIndex, attribute)
            $("#InputActionEdit").val(code)
            $('#dialogActionEditCode').dialog('option', 'title', "Edit " + actionContainer + " code for state " + stateName);
            dialogActionOpen(actionContainer, "Code", "edit")
        } else if (actionType == "timerStart") {
            var timerStartName = model.timerStartGetName(stateName, actionContainer, actionContainerIndex, actionIndex)
            $("#TimerStartName").val(timerStartName)
            var timerDuration = model.timerGetDuration(stateName, actionContainer, actionContainerIndex, actionIndex)
            $("#TimerDuration").val(timerDuration)
            $('#dialogActionEditTimerStart').dialog('option', 'title', "Edit timerStart in " + actionContainer + " for state " + stateName);
            dialogActionOpen(actionContainer, "TimerStart", "edit")
        } else if (actionType == "timerStop") {
            var timerStopName = model.timerStopGetName(stateName, actionContainer, actionContainerIndex, actionIndex)
            $("#TimerStopName").val(timerStopName)
            $('#dialogActionEditTimerStop').dialog('option', 'title', "Edit timerStop in " + actionContainer + " for state " + stateName);
            dialogActionOpen(actionContainer, "TimerStop", "edit")
        }
        return false
    }

    function onClickActionSave() {
        var actionContainer
        var actionIndex = 0
        var actionContainerIndex = 0
        var command = _command
        var actionType = _actionType
        var stateName = getCurrentStateName()
        var actionView = getCurrentViewAction()
        var transitionView = getCurrentViewTransition()
        var stateView = getCurrentViewState()

        if (actionView) {
            stateView = view.getStateFromAction(actionView)
            actionIndex = $(actionView).attr("data-action-index")
            actionContainer = $(getCurrentViewAction()).attr("data-action-container")
            actionContainerIndex = getActionContainerIndex(view, actionContainer, actionView)
        } else if (transitionView) {
            stateView = view.getStateFromTransition(transitionView)
            actionContainerIndex = $(transitionView).attr("data-transition-index")
            actionContainer = "transition"
        } else if (stateView) {
            actionContainer = _actionContainer
        } else {
            return
        }

        var hasError = false

        if (actionType == "Code") {
            var actionContent = $("#InputActionEdit").val()
            if (command == "add") {
                model.addCode(stateName, actionContainer, actionContainerIndex, actionContent, actionIndex)
            } else {
                var attribute = $(getCurrentViewAction()).attr("data-action-attribute")
                model.editCode(stateName, actionContainer, actionContainerIndex, actionContent, actionIndex, attribute)
            }
        } else if (actionType == "TimerStart") {
            var timerStartName = $("#TimerStartName").val()
            var timerDuration = $("#TimerDuration").val()
            if (timerDuration == "") {
                hasError = true
                setError("#TimerDuration", "duration cannot be empty")
            } else if (timerStartName == undefined) {
                hasError = true
                setError("#TimerStartName", "timer name cannot be empty")
            } else {
                if (command == "add") {
                    model.timerStartAdd(stateName, actionContainer, actionContainerIndex, actionIndex, timerStartName, timerDuration)
                } else {
                    model.timerStartEdit(stateName, actionContainer, actionContainerIndex, actionIndex, timerStartName, timerDuration)
                }
            }
        } else if (actionType == "TimerStop") {
            var timerStopName = $("#TimerStopName").val()
            if (timerStopName) {
                if (command == "add") {
                    model.timerStopAdd(stateName, actionContainer, actionContainerIndex, actionIndex, timerStopName)
                } else {
                    model.timerStopEdit(stateName, actionContainer, actionContainerIndex, actionIndex, timerStopName)
                }
            }
        }

        if (hasError == false) {
            $("#dialogActionEdit" + actionType).dialog('close');
            saveAndShowStateView()
        }
    }

    function onClickActionCut(evt) {
        var stateName = getCurrentStateName()
        var actionView = getCurrentViewAction()
        var stateView = view.getStateFromAction(actionView)
        var actionIndex = $(actionView).attr("data-action-index")
        var actionContainerName = $(actionView).attr("data-action-container")
        var actionContainerIndex = getActionContainerIndex(view, actionContainerName, actionView)
        var attribute = $(getCurrentViewAction()).attr("data-action-attribute")
        $copiedAction = model.actionCopy(stateName, actionContainerName, actionContainerIndex, actionIndex, attribute)
        model.actionRemove(stateName, actionContainerName, actionContainerIndex, actionIndex, attribute)
        saveAndShowStateView()
    }

    function onClickActionPaste(evt) {
        var below = evt.data.below
        var stateName = getCurrentStateName()
        var actionView = getCurrentViewAction()
        var stateView = view.getStateFromAction(actionView)
        var actionIndex = $(actionView).attr("data-action-index")
        var actionContainerName = $(actionView).attr("data-action-container")
        var actionContainerIndex = getActionContainerIndex(view, actionContainerName, actionView)
        var attribute = $(getCurrentViewAction()).attr("data-action-attribute")
        model.actionPaste(stateName, actionContainerName, actionContainerIndex, actionIndex, below, $copiedAction)
        saveAndShowStateView()
    }

    /////////////
    // Event
    /////////////

    function createDrilldown(name) {
        var content = $(".DrillDownTopContainer" + name).first().clone()
        var drillDownId = "drillDown" + name + "Cloned"

        $(".qtip").remove();
        $("#" + drillDownId).remove()

        content.find(".drillDown" + name).attr("id", drillDownId)
        var lastContainer = $(".DrillDownTopContainer" + name).last()
        content.insertAfter(lastContainer)

        $("#" + drillDownId).dcDrilldown({
            speed: 'fast',
            saveState: false,
            showCount: false,
            defaultText: name + " Operations"
        });
        return content
    }

    function createEventDrilldown() {
        var content = createDrilldown("Event")
        return content
    }

    function initEventMenuCallback() {
        $('.EventAdd').bind('click', onClickEventAdd);
        $('.EventEdit').bind('click', onClickEventEdit);
        $('.EventCut').bind('click', onClickEventCut);
        $('.EventPasteAbove').bind('click', { below: false }, onClickEventPaste);
        $('.EventPasteBelow').bind('click', { below: true }, onClickEventPaste);
    }

    function initEvent() {
        $('.event').bind('click', function (event) {
            var content = createEventDrilldown()
            setCurrentViewEvent($(this))
            createMenu($(this), event, content, "Event");
            initEventMenuCallback()
        });
    }

    function initDialogEvent() {
        createDialog("dialogEventEdit", "Save event", onClickEventSave)
    }

    function initDialogEventSource() {
        createDialog("dialogEventSourceEdit", "Save event source", onClickEventSourceSave)
    }

    function onClickEventAdd(evt) {
        _eventIdCurrent = ""
        _eventNameCurrent = ""

        $("#SelectEventType").val("event")
        $("#InputEventId").val("")
        $("#InputEventParams").val("")
        $("#InputEventName").val("")
        $("#InputEventPreAction").val("")
        $("#InputEventPostAction").val("")

        $('#dialogEventEdit').dialog('option', 'title', "Add new event");
        dialogEventOpen("add")
    }

    function onClickEventEdit(evt) {
        var eventView = getCurrentViewEvent()
        var eventId = view.getEventId(eventView);

        if (eventId == undefined) {
            return;
        }
        var eventSource = view.getEventSource(eventView)

        _eventIdCurrent = eventId
        _eventNameCurrent = model.getEventName(eventId)

        $("#SelectEventType").val(model.getEventType(eventId))
        $("#InputEventId").val(eventId)
        $("#InputEventParams").val(model.getEventParams(eventId))
        $("#InputEventName").val(eventId)
        $("#InputEventPreAction").val(model.getEventPreAction(eventId))
        $("#InputEventPostAction").val(model.getEventPostAction(eventId))
        $('#dialogEventEdit').dialog('option', 'title', "Update event");
        dialogEventOpen("edit")
    }

    function onClickEventCut(evt) {
        var eventView = getCurrentViewEvent()
        var eventId = view.getEventId(eventView)
        var eventSource = view.getEventSource(eventView)

        $copiedEvent = model.eventCopy(eventId)
        model.eventRemove(eventId)
        saveAndShowEventView()
    }

    function onClickEventPaste(evt) {
        var below = evt.data.below
        var eventView = getCurrentViewEvent()
        var eventId = view.getEventId(eventView)
        var eventSource = view.getEventSource(eventView)

        model.eventPaste(eventId, below, $copiedEvent)
        saveAndShowEventView()
    }

    function dialogEventOpen(command) {
        hideToolTip()
        _command = command
        $("#dialogEventEdit").dialog('open');
        unsetError("#InputEventName")
        unsetError("#InputEventId")
        $("#InputEventId").focus()
        return false
    }

    function onClickEventSave() {
        var command = _command
        var eventView = getCurrentViewEvent()
        var eventIdCurrent = view.getEventId(eventView)
        var eventSource = view.getEventSource(eventView)

        var eventType = $("#SelectEventType").val()
        var eventIdNew = $("#InputEventId").val()
        var params = $("#InputEventParams").val()
        var eventName = $("#InputEventName").val()
        var preAction = $("#InputEventPreAction").val()
        var postAction = $("#InputEventPostAction").val()

        if (eventName == "" && eventType == "timer") {
            eventName = eventIdNew
        }

        var error = false

        var errorEventId = isEventIdValid(eventIdNew)
        if (errorEventId) {
            error = true
            setError("#InputEventId", errorEventId)
        } else if ((eventIdNew != eventIdCurrent) && (model.hasEventId(eventIdNew) == true)) {
            error = true
            setError("#InputEventId", "Duplicated event Id")
        }

        var errorEventName = isEventNameValid(eventName)
        if (errorEventName) {
            error = true
            setError("#InputEventName", errorEventName)
        }

        if (error == false) {
            if (command == "add") {
                model.eventAdd(eventSource, eventType, eventIdNew, params, eventName, preAction, postAction, eventIdCurrent)
            } else {
                model.eventEdit(eventSource, eventType, eventIdNew, params, eventName, preAction, postAction, eventIdCurrent)
            }
            $("#dialogEventEdit").dialog('close');
            saveAndShowEventView()
        }
    }

    /////////////
    // EventSource
    /////////////

    function createMenu(view, event, content, name) {
        view.qtip({
            prerender: true,
            overwrite: true,
            content: {
                text: content
            },
            position: {
                my: 'top center',  // Position my top left...
                at: 'bottom center', // at the bottom right of...
                viewport: $(window)
            },
            show: {
                event: 'click',
                ready: true
            },
            hide: {
                event: 'unfocus'
            },
            style: {
                classes: 'ui-widget',
                widget: true
            },

            events: {
                show: function () {
                },
                hide: function () {
                    $(this).qtip("destroy")
                    $("#drillDown" + name + "Cloned").remove()
                },
                render: function (event, api) {
                    if (event.originalEvent.button !== 0) {
                        try { event.preventDefault(); } catch (e) { }
                    }
                }
            }
        }, event)
    }

    function createEventSourceDrilldown() {
        var content = createDrilldown("EventSource")
        return content
    }

    function initEventSourceMenuCallback() {
        $('.EventSourceAdd').bind('click', onClickEventSourceAdd);
        $('.EventSourceEdit').bind('click', onClickEventSourceEdit);
        $('.EventSourceCut').bind('click', onClickEventSourceCut);
        $('.EventSourcePasteAbove').bind('click', { below: false }, onClickEventSourcePaste);
        $('.EventSourcePasteBelow').bind('click', { below: true }, onClickEventSourcePaste);
    }

    function initEventSource() {
        $('.eventSource').bind('click', function (event) {
            var content = createEventSourceDrilldown()
            setCurrentViewEvent($(this))
            createMenu($(this), event, content, "EventSource");
            initEventSourceMenuCallback()
        });

   
    }

    function onClickEventSourceAdd(evt) {
        var eventView = getCurrentViewEvent()
        var eventSource = view.getEventSource(eventView)
        _eventSourceCurrent = eventSource

        $("#InputEventSource").val("")
       
        $('#dialogEventSourceEdit').dialog('option', 'title', "Add new event source");
        dialogEventSourceOpen("add")
    }

    function onClickEventSourceEdit(evt) {
        var eventView = getCurrentViewEvent()
        var eventSource = view.getEventSource(eventView)
        if (eventSource == undefined) {
            return;
        }

        _eventSourceCurrent = eventSource
        $("#InputEventSource").val(eventSource)

        $('#dialogEventSourceEdit').dialog('option', 'title', "Update event source");
        dialogEventSourceOpen("edit")
    }

    function onClickEventSourceCut(evt) {
        var eventView = getCurrentViewEvent()
        var eventSource = view.getEventSource(eventView)

        $copiedEventSource = model.eventSourceCopy(eventSource)
        model.eventSourceRemove(eventSource)
        saveAndShowEventView()
    }

    function onClickEventSourcePaste(evt) {
        var below = evt.data.below
        var eventView = getCurrentViewEvent()
        var eventSource = view.getEventSource(eventView)

        model.eventSourcePaste(eventSource, below, $copiedEventSource)
        saveAndShowEventView()
    }

    function dialogEventSourceOpen(command) {
        hideToolTip()
        _command = command
        $("#dialogEventSourceEdit").dialog('open');
        unsetError("#InputEventSource")
        $("#InputEventSource").focus()
        return false
    }

    function onClickEventSourceSave() {
        var command = _command
        var eventView = getCurrentViewEvent()
        var eventSource = $("#InputEventSource").val()

        var error = false
        if (((command == "add") || (_eventSourceCurrent != eventSource)) && model.hasEventSource(eventSource)) {
            error = true
            setError("#InputEventSource", "Event source already exist")
        }

        if (error == false) {
            if (command == "add") {
                model.eventSourceAdd(_eventSourceCurrent, eventSource)
            } else {
                model.eventSourceEdit(_eventSourceCurrent, eventSource)
            }

            $("#dialogEventSourceEdit").dialog('close');
            saveAndShowEventView()
        }
    }

    function isEventIdValid(eventId) {
        if (eventId == "") {
            return "Event id cannot be empty";
        }
        if (eventId == _eventIdCurrent) {
            return
        }

        var regEx = new RegExp("^[a-zA-Z_][a-zA-Z0-9_]*$")
        if (!regEx.test(eventId)) {
            return "Invalid event id"
        }


    }

    function isEventNameValid(eventName) {
        if (eventName == _eventNameCurrent) {
            return
        }

        if (eventName == "") {
            return
        }

        var regEx = new RegExp("^[a-zA-Z_][a-zA-Z0-9_]*$")
        if (!regEx.test(eventName)) {
            return "Invalid event name"
        }

        if (model.hasEventName(eventName) == true) {
            return "Duplicated event name"
        }
    }

    //////////////
    // Parallel
    //////////////
    function onClickParallelAdd(evt) {
        var stateName = getCurrentStateName()
        hideToolTip()

        unsetError("#InputSelectParallelAddNextState")

        $("#ParallelRegionCount").val("2")

        $("#InputSelectParallelAddNextState").val("")

        if (model.isStateRoot(stateName) == false) {
            $("#dialogParallelNextState").css("display", "")
            fillSelect('#SelectParallelAddNextState', model.getNextStateNameList(stateName))
        } else {
            $("#dialogParallelNextState").css("display", "none")
        }

        $("#dialogParallelAdd").dialog('open');
        return false
    }

    function onClickParallelAddSave(evt) {
        hideToolTip()
        var stateName = getCurrentStateName()
        var parallelCount = $("#InputParallelRegionCount").val()
        var nextState = $("#InputSelectParallelAddNextState").val()
        var hasError

        if (model.isStateRoot(stateName) == false) {
            var error = isValidNextState(nextState)
            if (error) {
                hasError = true
                setError("#InputSelectParallelAddNextState", error)
            }
        }

        if (!hasError) {
            $("#dialogParallelAdd").dialog('close');
            model.parallelAdd(stateName, parallelCount, nextState)
            saveAndShowStateView()
            
        }
    }

    function onClickParallelEdit(evt) {

        setCurrentViewParallel(this)
        
        var stateName = getCurrentStateName()
        hideToolTip()

        unsetError("#InputSelectParallelEditNextState")

        fillSelect('#SelectParallelEditNextState', model.getNextStateNameList(stateName))
        $("#InputSelectParallelEditNextState").val(model.parallelGetNextState(stateName))
        $("#dialogParallelEdit").dialog('open');
        return false
    }

    function onClickParallelEditSave(evt) {
        hideToolTip()
        var stateName = getCurrentStateName()
        var nextState = $("#InputSelectParallelEditNextState").val()
        var hasError

        var error = isValidNextState(nextState)
        if (error) {
            hasError = true
            setError("#InputSelectParallelEditNextState", error)
        }

        if (!hasError) {
            $("#dialogParallelEdit").dialog('close');
            model.parallelEdit(stateName, nextState)
            saveAndShowStateView()
        }
    }

    function onClickParallelRemove(evt) {
        var stateName = getCurrentStateName()
        hideToolTip()
        model.parallelRemove(stateName)
        saveAndShowStateView()
    }

    /////////////
    /// Utils
    /////////////

    function getActionContainerIndex(view, actionContainer, actionView) {
        var actionContainerIndex = 0
        if (actionContainer == "transition") {
            var transitionView = view.getTransitionFromAction(actionView)
            actionContainerIndex = $(transitionView).attr("data-transition-index")
        }

        return actionContainerIndex
    }

    function isValidState(stateName) {
        if ((stateName == "") || (stateName == textEnterStateName)) {
            return "State cannot be empty";
        }

        var regEx = new RegExp("^[a-zA-Z_][a-zA-Z0-9_]*$")
        if (!regEx.test(stateName)) {
            return "Invalid state name"
        }
    }

    function isValidNextState(stateName) {
        if (stateName == "") {
            return "Next state cannot be empty";
        }

        if (!stateName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
            return "Invalid state name"
        }
    }

    function checkFileApi() {
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList) {
            // Great success! All the File APIs are supported.
            apiFile = true
        } else {
            apiFile = false
        }
    }

    function modelModified() {
        if (stateEditorMainWindow != undefined) {
            stateEditorMainWindow.modelModified()
        }
    }
}


// Changes the cursor to an hourglass
function cursor_wait() {
    document.body.style.cursor = 'wait';
}

// Returns the cursor to the default pointer
function cursor_clear() {
    document.body.style.cursor = 'default';
}

$(document).ready(function () {
    //browserCheck();
    //examplesCreateAll();
    stateMachineInit("");
});

function stateMachineInit(from) {
    stateMachineController = new StateMachineController()
    stateMachineController.init(from)
}

function stateMachineGetXmlContent() {
    return stateMachineController.getXmlContent()
}

function stateMachineSetXmlContent() {
    if (stateEditorMainWindow != undefined) {
        stateMachineInit("fromLocalFile")
        stateMachineController.setXmlContent(stateEditorMainWindow.getXmlContent())
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

module.exports = StateMachineController;

(function ($) {
    $.widget("ui.combobox", {
        _create: function () {
            var self = this,
					select = this.element.hide(),
					selected = select.children(":selected"),
					value = selected.val() ? selected.text() : "";
            var input = this.input = $("<input>")
					.insertAfter(select)
					.val(value)
					.autocomplete({
					    delay: 0,
					    minLength: 0,
					    source: function (request, response) {
					        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
					        response(select.children("option").map(function () {
					            var text = $(this).text();
					            if (this.value && (!request.term || matcher.test(text)))
					                return {
					                    label: text.replace(
											new RegExp(
												"(?![^&;]+;)(?!<[^<>]*)(" +
												$.ui.autocomplete.escapeRegex(request.term) +
												")(?![^<>]*>)(?![^&;]+;)", "gi"
											), "<strong>$1</strong>"),
					                    value: text,
					                    option: this
					                };
					        }));
					    },
					    select: function (event, ui) {
					        ui.item.option.selected = true;
					        self._trigger("selected", event, {
					            item: ui.item.option
					        });
					    },
					    change: function (event, ui) {
					        if (!ui.item) {
					            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
									valid = false;
					            select.children("option").each(function () {
					                if ($(this).text().match(matcher)) {
					                    this.selected = valid = true;
					                    return false;
					                }
					            });
					        }
					    }
					})
					.addClass("ui-widget ui-widget-content ui-corner-left");

            input.attr("id", "Input" + select.attr("id"))

            input.data("autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a>" + item.label + "</a>")
						.appendTo(ul);
            };

            this.button = $("<button type='button'>&nbsp;</button>")
					.attr("tabIndex", -1)
					.attr("title", "Show All Items")
					.insertAfter(input)
					.button({
					    icons: {
					        primary: "ui-icon-triangle-1-s"
					    },
					    text: false
					})
					.removeClass("ui-corner-all")
					.addClass("ui-corner-right ui-button-icon")
					.click(function () {
					    // close if already visible
					    if (input.autocomplete("widget").is(":visible")) {
					        input.autocomplete("close");
					        return;
					    }

					    // work around a bug (likely same cause as #5265)
					    $(this).blur();

					    // pass empty string as value to search for, displaying all results
					    input.autocomplete("search", "");
					    input.focus();
					});
        },

        destroy: function () {
            this.input.remove();
            this.button.remove();
            this.element.show();
            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);