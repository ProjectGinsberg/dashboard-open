controllers.controller('EventChartController',
	["$scope", "$log", "Events", function($scope, $log, Events) {
	'use strict';
	var fetchData = function() {
		//$log.log("Updating event data");
		Events.query(
			{
				start: $scope.periodStart().format(),
				end: $scope.periodUpperBound().format()
			},
			function(data) {
				$scope.eventData = data;
			},
			function(e) {
				$log.log(e);
				$scope.eventData = [];
			});
	};

	$scope.eventData = [];
	$scope.updateEventData = fetchData;
	$scope.$watch("periodSelection()", fetchData);
}]);
