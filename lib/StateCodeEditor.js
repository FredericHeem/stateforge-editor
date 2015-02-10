"use strict";
var EventEmitter = require('events').EventEmitter;
var ace = require('brace');
require('brace/mode/xml');
require('brace/theme/monokai');

var StateCodeEditor = function(){
    this.emitter = new EventEmitter();
    var emitter = this.emitter;
    var editor;
    var editorApiWriting;
    
    init();
    function init() {
        if (editor) {
            return;
        }
        
        editor = ace.edit("editor");
        editor.getSession().setMode('ace/mode/xml');
        editor.setTheme('ace/theme/monokai');
    }
    
    this.update = function(xmlContent) {
        init()
        var me = this;
        editor.getSession().on('change', function () {
            if ((editorApiWriting == false) && (me.getContent() != "")) {
                emitter.emit("modelMofified", me.getContent());
            }
        });

        this.setContent(xmlContent)
        resize()
    }

    this.setContent = function(content) {
        if (editor && content) {
            editorApiWriting = true
            editor.getSession().setValue(content)
            editorApiWriting = false
            editor.gotoLine(0);
        }
    }

    this.getContent = function() {
        if (editor) {
            return editor.getSession().getValue()
        } else {
            return ""
        }
    }

    function resize() {
        $('#StateMachineEditor').css('width', document.body.clientWidth);
        var height = getDocHeight() - $('.yui-nav').height() - $('#EditorMenuContainer').height();
        $('#StateMachineEditor').css('height', height);
        editor.resize()
    }
    
    function getDocHeight() {
        var D = document;
        return Math.max(D.body.clientHeight, D.documentElement.clientHeight);
    }
}

var StateForge = window.StateForge || {};
StateForge.StateCodeEditor = StateCodeEditor;
window.StateForge = StateForge;


module.exports = StateCodeEditor;