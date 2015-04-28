/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');
describe('MyGraphSteps', function() {
    var user;
    var signup;
    var myGraph = new MyGraph();

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

    var selectSteps  = function() {
        myGraph.selectObjectiveSeries('step count');
        expect(myGraph.selectedObjectiveSeries()).toEqual('step count');
    };

    it('should be able to create a steps record',function() {
        selectSteps();
        myGraph.clickAddNewObjectiveMeasureForToday();
        myGraph.submitSteps();
        expect(myGraph.countObjectiveMeasures()).toBe(1);
    });
});
