'use strict';

angular.module('gb.myGraph')
.controller('DeleteWellbeingController', ["$scope", "$route", "$http", "$log", "$q", "Popover", "Wellbeing", function($scope, $route, $http, $log, $q, Popover, Wellbeing) {

	$scope.submitting = false;

	$scope.submit = function() {
		$scope.submitting = true;

		var datum = $scope.wellbeingDatumToDelete;
		if (!datum) return;
		$log.log("Deleting data for", datum.timestamp);

		var start = moment(datum.timestamp).local().startOf("day");
		var end = moment(datum.timestamp).local().endOf("day").add("seconds", -1);

		var wellbeing_measure = $scope.wellbeingSelection();
		Wellbeing.query({
			id: wellbeing_measure.id,
			start: start.format('YYYY-MM-DDTHH:mm:ssZ'),
			end: end.format('YYYY-MM-DDTHH:mm:ssZ'),
		})
		.$promise
		.then(function(data) {
			$log.log("Deleting", data);
			return $q.all(_.chain(data)
				// HACK: Post filter the data because server time handling is questionable
				.filter(function(data) { var ts = moment(data.timestamp); return ts.isAfter(start.add("seconds", -1)) && ts.isBefore(end); })
				.forEach(function(d) { $log.log("Deleting", d); return d.$delete(); }));
		})
		.then(function() {
			// HACK: The backend needs a bit of time to commit the transaction, or something...
			setTimeout(function() {
				$scope.submitting = false;
				Popover.hide();
				$scope.fetchGraphData();
			}, 1000);
		})
	}


}]);
