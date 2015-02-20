describe('StateMachineView', function () {
    "use strict";

    before(function () {
    });
    describe('Ping', function () {
        var model;
        before(function () {
            var fsmContent = exampleMap['Ping.fsmcs'];
            model = new StateForge.StateMachineModel();
            model.xmlToDom(fsmContent);
        });
        it('should have init view', function (done) {
            var view = new StateForge.StateMachineView();
            view.buildStateView(model);
            done()
        });
    }); 
    describe('All', function () {
        it('All', function (done) {
            //console.log("processing ", Object.keys(exampleMap).length)
            for(var index in exampleMap) { 
                var fsmContent = exampleMap[index];
                var model = new StateForge.StateMachineModel();
                model.xmlToDom(fsmContent);
                var view = new StateForge.StateMachineView();
                view.buildStateView(model);
            }
            
            done()
        });
        
    });
});
