/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');
describe('MyGraphExercise', function() {
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

    var selectExercise  = function() {
        myGraph.selectObjectiveSeries('exercise');
        expect(myGraph.selectedObjectiveSeries()).toEqual('exercise');
    };

    it('should be able to create an exercise record',function() {
        selectExercise();
        myGraph.clickAddNewObjectiveMeasureForToday();
        myGraph.submitExercise();
        expect(myGraph.countObjectiveMeasures()).toBe(1);
    });
});
