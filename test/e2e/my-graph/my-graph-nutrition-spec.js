/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');
describe('MyGraphNutrition', function() {
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

    var selectNutrition  = function() {
        myGraph.selectObjectiveSeries('nutrition');
        expect(myGraph.selectedObjectiveSeries()).toEqual('nutrition');
    };

    it('should be able to create a nutrition record',function() {
        selectNutrition();
        myGraph.clickAddNewObjectiveMeasureForToday();
        myGraph.submitNutrition();
        expect(myGraph.countObjectiveMeasures()).toBe(1);
    });
});
