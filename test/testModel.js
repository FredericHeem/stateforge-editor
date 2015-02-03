describe('StateMachineModel', function () {
    "use strict";

    before(function () {
    });
    
    describe('Ok', function () {
        it('Light.fsmcs', function (done) {
            var model = new StateForge.StateMachineModel();
            model.xmlToDom(fsmFile);
            done()
        });
        
    });
});
