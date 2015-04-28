/**
 * A periodSelection holds the start and end date for the currently selected
 * period.
 */
angular.module('gb.myGraph')
.controller('PeriodSelectionController', ["$scope", "$cookieStore", "$log", function($scope, $cookieStore, $log) {
	'use strict';

	var end = moment().startOf("day");
	var DEFAULT_PERIOD = 7;

	$scope.period = function(days) {
		if (days) {
			$cookieStore.put($scope.cookiePrefix + "period", days);
			updateSelection();
		}
		return $cookieStore.get($scope.cookiePrefix + "period") || DEFAULT_PERIOD;
	};

	$scope.periodEnd = function(endDate) {
		if (endDate) {
			end = moment(endDate).clone().startOf('day').max(moment().startOf("day")); // Don't stray into the future
			updateSelection();
		}
		return end.clone(); // moment
	};

	/**
	 * Use this when fetching data for a period range.
	 */
	$scope.periodUpperBound = function() {
		return end.clone().add("day", 1);
	};

	$scope.periodStart = function() {
		return end.clone().subtract(24 * $scope.period(), "hours");
	};

	// This tends to get $watched, so it's important to return the same
	// object every time.
	$scope.periodSelection = function() {
		return selection;
	};

	$scope.selectNextPeriod = function() {
		$scope.periodEnd(end.clone().add($scope.period(), "days"));
	};

	$scope.selectPreviousPeriod = function() {
		$scope.periodEnd($scope.periodStart());
	};

	$scope.hasNextPeriod = function() {
		return $scope.periodEnd().isBefore(moment().startOf("day"));
	};

	var selection;
	function updateSelection() {
			selection = _
				.range($scope.period() + 1)
				.map(function(x) {
					var d = end.clone().subtract(($scope.period() - x), 'days').toDate();
					console.log(d);
					return d;
				});
			$log.log(selection);
			$log.log("Period is " + $scope.period() + " days from " + $scope.periodStart().format() + " to " + end.format());
	}

	// Initialize
	updateSelection();
}])
.directive('periodSelection', ['$log', function($log) {
	'use strict';
	$log.log("Instantiating period selection");
	return {
		controller: 'PeriodSelectionController',
		link: function (scope, element, attrs) {
			$log.log("Linking period selection");
			scope.cookiePrefix = scope.$eval(attrs.cookiePrefix) || attrs.cookiePrefix || "";
			scope.period(scope.period()); // HACK: Force a selection update
		},
	};
}]);
