/* jshint ignore:start */
'use strict';
var Homepage = require('./homepage.po.js');
var SignupHelper = require('../signup-helper.js');

describe('Homepage', function() {
		var homepage = new Homepage();

		var user;
		var signup;

		beforeEach(function () {

			signup = new SignupHelper();
			user = signup.signup();

			homepage = new Homepage();
			browser.sleep(500);
		});
		afterEach(function() {
			return signup.deleteAccount().then(function() {
				return homepage.attemptSignout();
			});
		});
		it('should set username field',function() {
			homepage.setUsername(user.username);
			expect(homepage.getUsername()).toEqual(user.username);
		});
		it('should login valid user',function() {
			homepage.setUsername(user.username);
			homepage.setPassword(user.password);
			homepage.attemptLogin();
			expect(homepage.getWellbeingQuestions().count()).toEqual(3);
		});
		it('should not login user that doesnt exist',function() {
			homepage.setUsername('QWERTYUISDFGHJ@google.com'); // user shouldn't exist in the database
			homepage.setPassword('f');
			homepage.attemptLogin();
			expect(homepage.isLoginErrorMessageVisible()).toBe(true);
		});
		it('should not login user that has wrong password',function() {
			homepage.setUsername(user.username); // user shouldn't exist in the database
			homepage.setPassword('f');
			homepage.attemptLogin();
			expect(homepage.isLoginErrorMessageVisible()).toBe(true);
		});
		it('should display error message if both fields are empty',function() {
			homepage.attemptLogin();
			expect(homepage.isLoginErrorMessageVisible()).toBe(true);
		});
		it('should require the user to reauthenticate after they sign out',function() {
			homepage.setUsername(user.username);
			homepage.setPassword(user.password);
			homepage.attemptLogin();
			expect(homepage.getWellbeingQuestions().count()).toEqual(3);
			homepage.attemptSignout();
			homepage.get();
			expect(homepage.getUsername()).toEqual(''); // empty username ready to be entered
		});
});
