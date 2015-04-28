angular.module('gb.utils')
.factory('ResizeService', ['$window', '$timeout', '$log', function($window, $timeout, $log) {
	'use strict';

	var DEBOUNCE = 500;
	var service = {};
	var listeners = [];
	var timeout = undefined;

	angular.element($window).on('resize', function() {
		if (timeout) return; // If there's already a timeout, leave it
		timeout = $timeout(function() {
			notify();
			timeout = undefined;
		}, DEBOUNCE);
	});

	var notify = function() {
		$log.log("Resized!");
		_.forEach(listeners, function(listener) {
			listener();
		});
	}

	service.addListener = function(listener) {
		listeners.push(listener);
	};

	return service;
}]);