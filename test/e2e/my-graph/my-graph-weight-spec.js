/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');

describe('MyGraphWeight', function() {
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

    var selectWeight  = function() {
        myGraph.selectObjectiveSeries('weight');
        expect(myGraph.selectedObjectiveSeries()).toEqual('weight');
    };

    it('should be able to create a weight record',function() {
        selectWeight();
        myGraph.clickAddNewObjectiveMeasureForToday();
        myGraph.submitWeight();
        expect(myGraph.countObjectiveMeasures()).toBe(1);
    });
});
