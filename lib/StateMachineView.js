// StateMachineView.js
// All rights reserved 2011-2013, StateForge.
// Frederic Heem - frederic.heem@gmail.com
/*global $, jQuery*/
/*jslint browser:true */

function StateMachineView(options) {
    "use strict";
    var options = options || {};
    var diagramEl = options.diagramEl || "StateMachineDiagram";
    var $diagramEl = $("#" + diagramEl);
    var _model;
    var me = this;
    this.resetStateView = function () {
        $(".qtip").remove();
        $(".DrillDownTopContainerActionCloned").remove();
        $(".DrillDownTopContainerTransitionCloned").remove();
        $(".DrillDownTopContainerStateCloned").remove();
        $("#StateMachineDiagram").children().remove();
        
    };

    function addCssClass(){
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
                var $transition = me.getTransitionPointingToState($(this))
                $transition.addClass("ui-state-highlight");
            },
            function () {
                var $transition = me.getTransitionPointingToState($(this))
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
    
    this.resetEventView = function () {
        $("#TableEventBody").children().remove();
    };

    function isModelValid(model) {
        if ((model == undefined) || (model.isValid() == false)) {
            return false;
        } else {
            return true;
        }
    };

    this.buildStateView = function (model) {
        if (isModelValid(model) == false) {
            return;
        }

        _model = model;

        if (model.getLanguage() != "dotnet") {
            $(".EventPrePostAction").css("display", "none")
        }

        var stateMachineDiagram = document.getElementById("StateMachineDiagram");
        
        if(!stateMachineDiagram){
            throw "cannot find the state diagram element"
        }
        
        this.resetStateView();

        if (model.getXmlContent() == undefined) {
            throw "No model selected";
        }

        var $stateRoot = model.getStateRoot();
        if ($stateRoot.size() == 1) {
            this.stateParse(model, $stateRoot, null, null, stateMachineDiagram);
            this.writeTitle(model, stateMachineDiagram);
        } else {
            throw "Cannot the find root state";
        }
        
        addCssClass();
    }

    this.buildEventView = function (model) {

        if (isModelValid(model) == false) {
            return;
        }

        if (model.getXmlContent() == undefined) {
            throw "No model selected";
        }

        var view = this;
        model.getXml().find("eventSource").each(function () {
            view.buildEventSourceTable($(this))
        });
    }

    this.buildEventSourceTable = function ($eventSource) {
        var view = this;
        $eventSource.children().each(function (index) {
            view.createEventRow($eventSource, this, index)
        });
    }

    this.createEventRow = function ($eventSource, eventNode, index) {
        var eventSourceName = $eventSource.attr("name");
        var type = eventNode.nodeName;
        var id = $(eventNode).attr("id");
        var $tr = $(document.createElement('tr'));
        $tr.attr("data-event-source", eventSourceName);
        $tr.attr("data-event-id", id);

        $("#TableEventBody").append($tr)

        if (index == 0) {
            var $tdEventSourceName = $(document.createElement('th'));
            $tdEventSourceName.attr("rowspan", _model.getEventCount(eventSourceName));
            $tdEventSourceName.addClass("eventSource")
            $tdEventSourceName.text(eventSourceName);
            $tr.append($tdEventSourceName);
        }

        $tr.append("<td class='event'>" + id + "</td><td class='event'>" + type + "</td>")
    }

    this.getEventSource = function (eventView) {
        return $(eventView).parent().attr("data-event-source")
    }

    this.getEventId = function (eventView) {
        return $(eventView).parent().attr("data-event-id")
    }

    this.getStateName = function (state) {
        return $(state).attr('id')
    }

    this.getStateFromAction = function (action) {
        return action.parentNode.parentNode.parentNode.parentNode.parentNode
    }

    this.getStateFromTransition = function (transition) {
        return transition.parentNode.parentNode.parentNode
    }

    this.getStateFromParallel = function (parallel) {
        return parallel.parentNode.parentNode.parentNode
    }

    this.getTransitionFromAction = function (action) {
        return action.parentNode.parentNode
    }

    this.getTransitionPointingToState = function ($state) {
        var stateName = this.getStateName($state.parent())
        var $nextState = $(".nextState" + stateName)
        return $nextState.parent();
    }

    this.buildParallelNextState = function (model, $state, stateDiv, $parallel) {
        if (($parallel == undefined) || ($parallel.size() == 0)) {
            return;
        }

        if (model.isStateRoot(model.getStateName($state))) {
            return;
        }

        var nextStateName = model.getParallelNextState($parallel)

        var parallelTableDiv = document.createElement('table')
        stateDiv.appendChild(parallelTableDiv)
        $(parallelTableDiv).addClass("parallelTable")

        var tbodyDiv = document.createElement('tbody')
        parallelTableDiv.appendChild(tbodyDiv)

        var tr = document.createElement('tr');
        tr.setAttribute("class", "parallelTr");
        $(tr).addClass("parallelNextState")
        tbodyDiv.appendChild(tr);

        var tdArrow = document.createElement('td');
        tr.appendChild(tdArrow);
        $(tdArrow).addClass("shrink");
        //$(tdArrow).addClass("parallelNextState");
        tdArrow.innerHTML = "<span class='ui-icon ui-icon-circle-arrow-e'>";

        var tdNextState = document.createElement('td');
        tr.appendChild(tdNextState);
        $(tdNextState).addClass("parallelNextStateName");
        $(tdNextState).addClass("expand");
        if (nextStateName) {
            $(tdNextState).addClass("nextState" + nextStateName);
            tdNextState.innerHTML = nextStateName;
        } else {
            //td.innerHTML = "<span class=\"tagName\">self</span>";
        }
    }

    this.buildStateParallel = function (model, $stateCurrent, stateDiv, $parallel, stateChildrenDiv) {
        // Parallel State
        $(stateDiv).addClass("StateParallel");
        var $stateOrthogonalList = model.getChildList($parallel);
        for (i = 0; i < $stateOrthogonalList.length; i++) {
            var stateOrthogonalChild = $stateOrthogonalList[i];
            this.stateParse(model, $(stateOrthogonalChild), null, $stateCurrent, stateChildrenDiv);
        }
    }

    this.stateParse = function (model, $stateCurrent, $stateParent, $stateParallel, stateParentDiv) {
        var i
        var stateDiv = document.createElement('div')
        var stateName = model.getStateName($stateCurrent)
        stateDiv.setAttribute("id", stateName);

        var stateTitleDiv = document.createElement('div')
        stateDiv.appendChild(stateTitleDiv);
        $(stateTitleDiv).addClass("stateTitle")
        $("<span/>").addClass("stateTitleName").text(stateName).appendTo($(stateTitleDiv));

        var $parallel = model.getParallel(stateName);
        this.buildParallelNextState(model, $stateCurrent, stateDiv, $parallel);

        stateParentDiv.appendChild(stateDiv);

        var tableDiv = document.createElement('table')
        stateDiv.appendChild(tableDiv)

        var tbodyDiv = document.createElement('tbody')
        tableDiv.appendChild(tbodyDiv)

        this.writeEntryExit(model, $stateCurrent, tbodyDiv);
        this.writeTransitions(model, $stateCurrent, tbodyDiv);

        if ($stateParent == null) {
            if ($stateParallel == null) {
                $(stateDiv).addClass("StateRoot");
            } else {
                $(stateDiv).addClass("StateOrthogonal");
            }
        } else {
            $(stateDiv).addClass("State")
        }

        var $stateChildList = model.getChildList($stateCurrent);

        if (($parallel.size() == 0) && ($stateChildList.size() == 0)) {
            var stateKind = model.getStateKind(stateName);
            if (stateKind == "final") {
                $(stateDiv).addClass("StateFinal");
            } else if (stateKind == "history") {
                $(stateDiv).addClass("StateHistory");
            } else {
                $(stateDiv).addClass("StateLeaf");
            }
            return;
        }

        // for child and parallel state
        var stateTrChildrenDiv = document.createElement('tr')
        tbodyDiv.appendChild(stateTrChildrenDiv);

        var stateTdChildrenDiv = document.createElement('td')
        stateTdChildrenDiv.setAttribute("colspan", "5");
        stateTrChildrenDiv.appendChild(stateTdChildrenDiv);

        var stateChildrenDiv = document.createElement('div')
        stateChildrenDiv.setAttribute("class", "StateChildren");
        stateTdChildrenDiv.appendChild(stateChildrenDiv);

        if ($parallel.size() == 0) {
            // Child State
            for (i = 0; i < $stateChildList.length; i++) {
                var stateChild = $stateChildList[i];
                this.stateParse(model, $(stateChild), $stateCurrent, $stateParallel, stateChildrenDiv);
            }
        } else {
            this.buildStateParallel(model, $stateCurrent, stateDiv, $parallel, stateChildrenDiv);
        }

        return;
    }

    this.writeEntryExit = function (model, $state, stateDiv) {
        if ((model.getOnEntry($state).size() > 0) || (model.getOnExit($state).size() > 0)) {
            this.writeOnEntryExit(model, $state, stateDiv, "onEntry", "Entry");
            this.writeOnEntryExit(model, $state, stateDiv, "onExit", "Exit");
        }
    }

    this.writeOnEntryExit = function (model, $state, tbody, entryExitTagName, entryExitLabel) {
        var $entryExit = model.getFirstElement($state, entryExitTagName);

        if ($entryExit.size() > 0) {

            var tr = document.createElement('tr');
            tr.setAttribute("class", entryExitLabel)
            tbody.appendChild(tr);

            var tdEntryExitIcon = document.createElement('td');
            $(tdEntryExitIcon).addClass("shrink");
            tr.appendChild(tdEntryExitIcon);
            if (entryExitLabel == "Entry") {
                tdEntryExitIcon.innerHTML = "<span class='ui-icon ui-icon-circle-plus'>";
            } else {
                tdEntryExitIcon.innerHTML = "<span class='ui-icon ui-icon-circle-minus'>";
            }

            var actions = document.createElement('td');
            $(actions).addClass("actions");
            tr.appendChild(actions);
            actions.setAttribute("colspan", "4");
            
            if (model.hasAction($entryExit) == true) {
                this.writeActions(model, $state, $entryExit, actions);
            }
        }
    }

    this.writeTransitions = function (model, $state, stateDiv) {
        var $transitionList = model.getTransitionList($state);
        if ($transitionList.size() == 0) {
            return;
        }

        for (var i = 0; i < $transitionList.length; i++) {
            var transition = $transitionList[i];
            this.writeTransition(model, $state, $(transition), stateDiv, i);
        }
    }

    this.writeTransition = function (model, $state, $transition, tbody, index) {
        var tr = document.createElement('tr');
        tr.setAttribute("class", "transition");
        tr.setAttribute("data-transition-index", index);
        tbody.appendChild(tr);

        this.writeTransitionArrowEvent(model, tr)

        this.writeTransitionEvent(model, $transition, tr);
        if (model.hasStateAction($state)) {
            var td = document.createElement('td');
            $(td).addClass("shrink");
            tr.appendChild(td);
            this.writeActions(model, $state, $transition, td);
        }

        this.writeTransitionArrowState(model, tr)

        var nextState = model.getTransitionNextState($transition);
        this.writeTransitionNextState(model, nextState, tr);
    }

    this.writeTransitionArrowEvent = function (model, tr) {
        var td = document.createElement('td');
        tr.appendChild(td);
        $(td).addClass("shrink");
        $(td).addClass("transitionEventArrow");
        td.innerHTML = "<span class='ui-icon ui-icon-arrowreturnthick-1-n'>";
    }

    this.writeTransitionEvent = function (model, $transition, tr) {
        var td = document.createElement('td');
        tr.appendChild(td);
        $(td).addClass("shrink");
        $(td).addClass("transitionEvent");
        td.innerHTML = model.getTransitionName($transition);
    }

    this.writeTransitionArrowState = function (model, tr) {
        var td = document.createElement('td');
        tr.appendChild(td);
        $(td).addClass("shrink");
        $(td).addClass("transitionEventState");
        td.innerHTML = "<span class='ui-icon ui-icon-circle-arrow-e'>";
    }

    this.writeActions = function (model, $state, $node, td) {
        var containerName = $node.get(0).nodeName
        var actionInAttr = model.getActionInAttribute($node)
        if (actionInAttr) {
            this.writeAction(model, containerName, actionInAttr, true, td);
        }

        var me = this

        $node.find("action,timerStart,timerStop").each(function (index) {
            if (this.nodeName == "action") {
                me.writeAction(model, containerName, $(this).text(), false, td, index);
            } else if (this.nodeName == "timerStart") {
                me.writeTransitionTimerStart(model, containerName, $(this), td, index);
            } else if (this.nodeName == "timerStop") {
                me.writeTransitionTimerStop(model, containerName, $(this), td, index);
            }
        })
    }

    this.writeAction = function (model, containerName, actionContent, attribute, td, index) {
        if (actionContent) {
            var actionContentDiv = document.createElement('div');
            td.appendChild(actionContentDiv);
            actionContentDiv.setAttribute("class", "action");
            actionContentDiv.setAttribute("data-action-container", containerName);
            actionContentDiv.setAttribute("data-action-type", "code");

            if (attribute == true) {
                actionContentDiv.setAttribute("data-action-attribute", "true");
            } else {
                actionContentDiv.setAttribute("data-action-index", index);
            }

            var actionContentSpan = document.createElement('span');
            actionContentDiv.appendChild(actionContentSpan);
            actionContentSpan.setAttribute("class", "actionContent");
            actionContentSpan.appendChild(document.createTextNode(actionContent))
        }
    }

    this.writeTransitionTimerStart = function (model, containerName, $timerStart, td, index) {
        this.writeTransitionTimerCommon(model, containerName, $timerStart, td, "timerStart: ", model.getTimerName($timerStart), index)
    }

    this.writeTransitionTimerStop = function (model, containerName, $timerStop, td, index) {
        this.writeTransitionTimerCommon(model, containerName, $timerStop, td, "timerStop: ", model.getTimerName($timerStop), index)
    }

    this.writeTransitionTimerCommon = function (model, containerName, $timerStartStop, td, timerLabel, timerName, index) {
        var transitionActionContentDiv = document.createElement('div');
        td.appendChild(transitionActionContentDiv);
        transitionActionContentDiv.setAttribute("class", "action");
        transitionActionContentDiv.setAttribute("data-action-container", containerName);
        transitionActionContentDiv.setAttribute("data-action-type", $timerStartStop.get(0).nodeName);
        transitionActionContentDiv.setAttribute("data-action-index", index);
        var timerSpan = document.createElement('span');
        transitionActionContentDiv.appendChild(timerSpan);
        timerSpan.setAttribute("class", "tagName");
        timerSpan.appendChild(document.createTextNode(timerLabel));

        var actionContentSpan = document.createElement('span');
        transitionActionContentDiv.appendChild(actionContentSpan);
        actionContentSpan.setAttribute("class", "actionContent");
        actionContentSpan.appendChild(document.createTextNode(timerName))
    }

    this.writeTransitionNextState = function (model, nextState, tr) {
        var td = document.createElement('td');
        tr.appendChild(td);
        
        $(td).addClass("transitionNextState");
        $(td).addClass("expand");
        if (nextState) {
            $(td).addClass("nextState" + nextState);
            td.innerHTML = nextState;
        } else {
            td.innerHTML = "<span class=\"tagName\">self</span>";
        }
    }

    this.writeTitle = function (model, stateDiagramDiv) {
        var modelName = model.getName()
        if (modelName) {
            var titleDiv = document.createElement('h2');
            titleDiv.setAttribute("id", "StateMachineTitle");
            titleDiv.appendChild(document.createTextNode(modelName));
            stateDiagramDiv.appendChild(titleDiv);
        }
    }
}

module.exports = StateMachineView;