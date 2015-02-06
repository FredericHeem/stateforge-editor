describe('StateMachineModel', function () {
    "use strict";

    before(function () {
    });
    
    describe('Ok', function () {
        it('Light.fsmcs', function (done) {
            var fsmContent = exampleMap['Light.fsmcs'];
            var model = new StateForge.StateMachineModel();
            model.xmlToDom(fsmContent);

            done()
        });
        it('All', function (done) {
            //console.log("processing ", Object.keys(exampleMap).length)
            for(var index in exampleMap) { 
                var fsmContent = exampleMap[index];
                var model = new StateForge.StateMachineModel();
                model.xmlToDom(fsmContent);
            }
            
            done()
        });
        
    });
});
