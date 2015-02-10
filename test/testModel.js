describe('StateMachineModel', function () {
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
        it('should have 3 states', function (done) {
            var stateList = model.getStateNameList();
            expect(stateList).to.have.length(3);
            done()
        });
        it('should have state SendPingAndWaitForReply', function (done) {
            assert(model.hasState("SendPingAndWaitForReply"));
            done()
        });

        it('should have 5 events', function (done) {
            var eventList = model.getEventIdList();
            expect(eventList).to.have.length(5);
            done()
        });
        it('should have 1 timer event', function (done) {
            var timerList = model.getTimerNameList();
            expect(timerList).to.have.length(1);
            done()
        });
        it('should have event name Timer', function (done) {
            assert.equal(model.hasEventName("Timer"), true)
            done()
        });
        it('should have event id StartPing', function (done) {
            assert.equal(model.hasEventId("StartPing"), true)
            done()
        });
        it('should have event id EvTimer', function (done) {
            assert.equal(model.hasEventId("EvTimer"), true)
            done()
        });
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
