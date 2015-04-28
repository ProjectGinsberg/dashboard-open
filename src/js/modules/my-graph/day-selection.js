'use strict';

/**
 * A daySelection is a list of objects:
 * {
 * 	timestamp: day,
 * 	tags: ['list', 'of', 'tags'] // Canonically CSS classes I guess...
 * }
 */
angular.module('gb.myGraph')
.controller('DaySelectionController', ["$scope", "$log", function($scope, $log) {
	var selection = [];

	$scope.selectedDays = function(days) {
		if (days) {
			$log.log("Selected days", days);
			// TODO: Validate period and format?
			selection = days;
		}
		return selection;
	}

	$scope.$watch("periodSelection()", function() {
		selection = [];
	});

}])
.directive('daySelection', function() {
	var d = {};
	d.controller = 'DaySelectionController';
	return d;
})