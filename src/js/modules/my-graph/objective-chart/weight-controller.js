angular.module('gb.myGraph')
.controller('WeightController', ['$scope', '$http', 'Utils', 'Popover', function($scope, $http, Utils, Popover) {
		'use strict';
		var WEIGHT_UPPER_LIMIT = 500;
		$scope.weight = 0;
		$scope.submitting = false;

		$scope.isDefined = function(v) {
			var defined = angular.isDefined(v);
			var empty;
			if (defined)
				empty = !(eval("$scope." + v) || eval("$scope." + v) == 0);
				return (defined && !empty);
		}

		$scope.submit = function() {
			var datum = {
				timestamp: Utils.dayTimestamp($scope.date),
				weight: parseFloat($scope.weight),
			};
			if (datum.weight > WEIGHT_UPPER_LIMIT) {
				$scope.error = 'Please double check your weight entry as it appears to be too high.';
				return;
			} else if (isNaN(parseFloat(datum.weight)) && !isFinite(datum.weight)){
				$scope.error = 'Weight must be entered as a numeric value between 0 and 500';
				return;
			} else {
				$scope.error = '';
			}
			$scope.submitting = true;
			Popover.lock();
			$http.post('/data/o/body', datum)
				.success(function(data, status, headers, config) {
					$scope.fetchGraphData();
				}).error(function(data, status, headers, config) {
					$scope.error = 'FAILED! Please reload the page and try again';
				}).then(function() {
					Popover.unlock();
					$scope.hide();
					$scope.submitting = false;
				});
		};
}]);
