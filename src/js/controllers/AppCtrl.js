controllers.controller('AppController',
	['$scope', '$log', '$location', 'Stats', 'Popover', 'UserService',
	function($scope, $log, $location, Stats, Popover, UserService) {
	'use strict';

	$scope.logout = UserService.logout;

	/// Used to determine active state of nav items.
	$scope.isCurrentPath = function (path) {
		return $location.path().substr(0, path.length) == path;
	};

	/// Show "About Me" if there are 10 sleep data points in the last 365 days
	$scope.enoughSleepData = undefined;
	var start = moment().startOf("day").subtract("days", 365).format("YYYY-MM-DD");

	$log.log("Requesting sleep data for nav");
	Stats.get(
		{
			series: 'sleep',
			start: start,
			// Specify a range because this makes it a single pass operation
			rangeStart: 0,
			rangeEnd: 60,
			numBuckets: 1
		}, function(data) {
			$scope.enoughSleepData = (data.count >= 10);
		});

}]);
