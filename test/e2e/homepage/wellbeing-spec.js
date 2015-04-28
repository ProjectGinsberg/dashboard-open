/* jshint ignore:start */
'use strict';
var Homepage = require('./homepage.po.js');
var SignupHelper = require('../signup-helper.js');

describe('Homepage Wellbeing', function() {
	var user;
	var signup;
	var homepage = new Homepage();

	beforeEach(function () {

		signup = new SignupHelper();
		user = signup.signup();

		homepage = new Homepage();
		homepage.setUsername(user.username);
		homepage.setPassword(user.password);
		homepage.attemptLogin();

	});
	afterEach(function() {
		return signup.deleteAccount().then(function() {
			return homepage.attemptSignout();
		});
	});
	it('should be possible to change the wellbeing question answers',function() {
		var q1AnswerScore = 4;
		var q2AnswerScore = 3;
		var q3AnswerScore = 1;
		homepage.setWellbeingQuestionAnswer(0,q1AnswerScore);
		homepage.setWellbeingQuestionAnswer(1,q2AnswerScore);
		homepage.setWellbeingQuestionAnswer(2,q3AnswerScore);

		homepage.submitWellbeing();

		//expect(browser.getCurrentUrl()).toContain('#/my-graph');
	});
});
