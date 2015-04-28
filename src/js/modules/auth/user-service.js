/**
 * @ngdoc service
 * @name gb.dashboard:UserService
 * @description current user, login and logour stuff
 *
	{
		"first_name": "Kenny",
		"last_name": "Baxter",
		"who5_last_completed": null,
		"wellbeing_metrics": [
			{
				"id": 1,
				"question": "I've been dealing with problems well"
			},
			{
				"id": 2,
				"question": "I've been thinking clearly"
			},
			{
				"id": 3,
				"question": "I've been able to make up my own mind about things"
			}
		],
		"notifications": [
			{
				id: 123456,
				published: 123456,
				expiry: 654432,
				status: unread,
				title: "Introductory tour",
				type: "hopscotch-tour",
				body: {
					tour_id: "introduction"
				}
			}
		]
	}
 */
angular.module('gb.auth')
.factory('UserService',
	['Environment', '$log', '$http', '$q', '$rootScope', '$sce', 'AUTH_EVENTS', 'HttpBuffer',
	function(Environment, $log, $http, $q, $rootScope, $sce, AUTH_EVENTS, HttpBuffer) {
	'use strict';

	var user = null; // If null, the user is not logged in!
	var userPromise = null;

	var current = function() {
		return user;
	};

	var update = function() {
		return get(true);
	};

	// Returns a promise (of the user)
	var get = function(forceUpdate) {
		if (forceUpdate || userPromise === null) {
			userPromise = $http.get('/data/me').then(function(response) {
				if (response.status !== 200) return $q.reject(response);
				user = response.data;
				return user;
			});
		}
		return userPromise;
	};

	// Returns a promise...
	var login = function(username, password) {
		$log.log("Attempting to log in as ", username);
		var loginUrl = $sce.getTrustedUrl(Environment.platform('/account/externalsignin'));
		var promise = $http
			.post(loginUrl, {email: username, password: password})
			.then(function(resp) {
				// HACK: For some reason, the status code is in the body...
				if (resp.data.status !== 200) {
					loginFailed(resp);
					return $q.reject(resp);
				}
				loginConfirmed();
				return resp;
			})
			.then(function(resp) {
				return get();
			});
		return promise;
	};

	// Returns a promise
 	var logout = function() {
 		$log.log("Logging out...");
		var logoutUrl = $sce.getTrustedUrl(Environment.platform('/account/signout'));

		// HACK: Temporarily redirect to platform page
		window.location = logoutUrl;
		return;

		// FIXME: This is how it should work;
		var promise = $http.post(logoutUrl)
			.then(function(resp) {
				user = null;
				$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
				return resp;
			});
		return promise;
	};

	var loginFailed = function(data) {
		$log.log("Login failed");
		$rootScope.$broadcast(AUTH_EVENTS.loginFailed, data);
	};

	/**
	* Call this function to indicate that authentication was successfull and trigger a
	* retry of all deferred requests.
	* @param data an optional argument to pass on to $broadcast which may be useful for
	* example if you need to pass through details of the user that was logged in
	* @param configUpdater an optional transformation function that can modify the
	* requests that are retried after having logged in.  This can be used for example
	* to add an authentication token.  It must return the request.
	*/
  	var loginConfirmed = function(data, configUpdater) {
  		$log.log("Logged in");
	    var updater = configUpdater || function(config) {return config;};
	    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, data);
	    HttpBuffer.retryAll(updater);
	};

	/**
	* Call this function to indicate that authentication should not proceed.
	* All deferred requests will be abandoned or rejected (if reason is provided).
	* @param data an optional argument to pass on to $broadcast.
	* @param reason if provided, the requests are rejected; abandoned otherwise.
	*/
	var loginCancelled = function(data, reason) {
		$rootScope.$broadcast(AUTH_EVENTS.loginCancelled, data);
		HttpBuffer.rejectAll(reason);
	};

	// Experimenting. I find referring to service methods as service.blah
	// internally really annoying.
	return {
		current: current,
		update: update,
		get: get,
		login: login,
		logout: logout,
	};
}]);
