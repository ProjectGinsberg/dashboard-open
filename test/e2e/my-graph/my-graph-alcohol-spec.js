/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');

describe('MyGraphAlcohol', function() {
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

    var selectAlcohol  = function() {
        myGraph.selectObjectiveSeries('alcohol');
        expect(myGraph.selectedObjectiveSeries()).toEqual('alcohol');
    };

    it('should be able to create an alcohol record',function() {
        selectAlcohol();
        myGraph.clickAddNewObjectiveMeasureForToday();
        myGraph.submitAlcohol();
        expect(myGraph.countObjectiveMeasures()).toBe(1);
    });
});
