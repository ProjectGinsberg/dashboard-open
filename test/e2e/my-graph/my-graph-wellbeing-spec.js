/* jshint ignore:start */
'use strict';
var MyGraph = require('./my-graph.po.js');
var SignupHelper = require('../signup-helper.js');
describe('MyGraphWellbeing', function() {
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

    it('should be able to click on todays wellbeing record',function() {
        
    });
    it('should be possible to delete a wellbeing record',function() {

    });
    it('should be possible to switch from 7 day to 30 day views',function() {

    });
    it('should not be possible to set wellbeing for tomorrow',function() {

    });
});
