'use strict';
angular.module('gb.myGraph')
.controller('AddWellbeingController', ["$scope", "$route", "$log", "$http", "Popover", 'Utils',
	function($scope, $route, $log, $http, Popover, Utils) {

	// FIXME: Check $scope for wellbeingSelection()

	var answerSelection = undefined;
	$scope.submitting = false;
	$scope.error = undefined;

	$scope.answerSelection = function(answer) {
		if (angular.isDefined(answer)) {
			answerSelection = answer;
		}
		return answerSelection;
	}

	$scope.submit = function() {
		var wellbeingId = $scope.wellbeingSelection().id;
		var value = answerSelection + 1;

		if (!angular.isDefined(answerSelection) || value < 1 || value > 5) {
			$log.error("Bogus value " + answerSelection);
			return;
		}

		// FIXME: Check that value is 1-5
		var datapoint = {
			"measure_id": wellbeingId,
			"value": value,
			"timestamp": Utils.dayTimestamp($scope.date)
		};

		$scope.submitting = true;
		Popover.lock();
		$http.post("/data/wellbeing", datapoint)
		.success(function(data, status, headers, config) {
			$scope.fetchGraphData();
		})
		.error(function(data, status, headers, config) {
			$scope.error = "FAILED! Please reload the page and try again";
		}).then(function(){
			Popover.unlock();
			$scope.hide();
			$scope.submitting = false;
			$scope.error = undefined;
		});
	}
}])
