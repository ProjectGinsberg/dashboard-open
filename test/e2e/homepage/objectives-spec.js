/* jshint ignore:start */
'use strict';
var Homepage = require('./homepage.po.js');
var SignupHelper = require('../signup-helper.js');

describe('HomepageObjectives', function() {
		var homepage = new Homepage();

		var user;
		var signup;

		beforeEach(function () {

			signup = new SignupHelper();
			user = signup.signup();

			homepage = new Homepage();
			browser.sleep(500);

			homepage.setUsername(user.username);
			homepage.setPassword(user.password);
			homepage.attemptLogin();
		});
		afterEach(function() {
			return signup.deleteAccount().then(function() {
				return homepage.attemptSignout();
			});
		});
		it('should set sleep',function() {
            //homepage.clickAddSleep();
            homepage.addSleep("01:00","09:00");
			browser.sleep(10000);
            //homepage.clickStoreSleep();
            // expect first element of stored sleep to be
            // equal to the above parameters
		});
});
