'use strict';

$(document).ready(function () {
    var stateMachineExamples = require('./StateMachineExamples.js');
    stateMachineExamples.examplesCreateAll();
});


var StateMachineController = require('../lib/StateMachineController.js');


var App = function(){
    var stateMachineController = new StateMachineController()
};

var app = new App();
//app.start();

