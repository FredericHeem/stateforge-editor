'use strict';

$(document).ready(function () {
    var stateMachineExamples = require('./StateMachineExamples.js');
    stateMachineExamples.examplesCreateAll();
    
    var StateDiagramEditor = require('../lib/StateDiagramEditor.js');
    var stateDiagramEditor = new StateDiagramEditor()
    
});

