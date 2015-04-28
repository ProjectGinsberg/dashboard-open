/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');

describe('MyGraphSleep', function() {
    var user;
    var signup;
    var myGraph;

    beforeEach(function () {

        signup = new SignupHelper();
        user = signup.signup();

        myGraph = new MyGraph();
        myGraph.setUsername(user.username);
        myGraph.setPassword(user.password);
        myGraph.attemptLogin();

    });
    afterEach(function() {
        return signup.deleteAccount().then(function() {
            return myGraph.attemptSignout();
        });
    });

    var selectSleep  = function() {
        myGraph.selectObjectiveSeries('sleep');
        expect(myGraph.selectedObjectiveSeries()).toEqual('sleep');
    };

    it('should be able to create a sleep record',function() {
        selectSleep();
        myGraph.clickAddNewObjectiveMeasureForToday();
        myGraph.setSleepTimes('2200','0800');
        myGraph.submitSleep();
        expect(myGraph.countObjectiveMeasures()).toEqual(1);
        myGraph.clickObjectiveMeasureForToday();

    });
    it('should be possible to delete a sleep record',function() {
        selectSleep();
    });
});
