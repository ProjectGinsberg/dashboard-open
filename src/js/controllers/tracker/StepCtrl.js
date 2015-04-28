controllers.controller('StepController', ['$scope', '$http', '$route', 'Popover', 'Utils',
	function StepController($scope, $http, $route, Popover, Utils) {
		'use strict';
		var STEPS_UPPER_LIMIT = 100000;
		$scope.step_count = 0;
		$scope.submitting = false;
		$scope.error = '';

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
				activity_type: 'Aggregated',
				step_count: parseInt($scope.step_count)
			};
			if (datum.step_count > STEPS_UPPER_LIMIT) {
				$scope.error = 'Please double check your step count entry as it appears to be too high.';
				return;
			} else if (isNaN(parseFloat(datum.step_count)) && !isFinite(datum.step_count)){
				$scope.error = 'Step count must be entered as a numeric value between 0 and 100,000';
				return;
			} else {
				$scope.error = '';
			}
			$scope.submitting = true;
			Popover.lock();
			$http.post('/data/o/stepcount', datum)
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
	}
]);
