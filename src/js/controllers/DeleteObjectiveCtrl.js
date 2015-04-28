'use strict';
controllers.controller('DeleteObjectiveController', ["$scope", "$http", "$route", "$log", "Popover", function($scope, $http, $route, $log, Popover) {

	$scope.loading = false;
	$scope.submitting = false;

	$scope.delete = function(datum) {
		if (!datum) {
			$log.error("No datum to delete");
			return;
		}
		$log.debug("Deleting", datum);

		$scope.submitting = true;
		Popover.lock();
		datum
			.$delete()
			.then(function() {
				$scope.submitting = false;
				$scope.fetchGraphData();
				Popover.unlock();
				Popover.hide();
				update();
			});
	};

	var preprocess = function(data_in) {
		var data = _.map(data_in, function(datum) {
			datum.amount = datum[$scope.objectiveSelection().property];
			return datum;
		});
		return data;
	}

	var update = function() {
		$scope.data = [];
		var date = $scope.objectiveDeleteDate;

		if (!angular.isDefined(date)) {
			return;
		}

		$scope.loading = true;
		var date_string = moment(date).toISOString();
		var end_date = moment(date).add("day", 1).toISOString();
		$scope.objectiveSelection().resource.query({start: date_string , end: end_date}, function(data){
			//$log.log("get", data)
			$scope.data = preprocess(data);
			$scope.loading = false;
		},
		function(e){
			$log.error(e);
			$scope.loading = false;
				// And?
			});
	};

	$scope.$watch("objectiveDeleteDate", update);

}]);
