controllers.controller('ExerciseController', ['$scope', '$http', '$route', 'Popover', 'Utils',
	function ExerciseController($scope, $http, $route, Popover, Utils) {

		'use strict';
		$scope.activityType = 'Walking';
		$scope.calories = '';

		$scope.submitting = false;

		$scope.canSubmit = function() {
			var canSubmit = ($scope.exerciseType && $scope.caloriesBurnt)
			return canSubmit;
		};

		$scope.submit = function() {
			var datum = {
				timestamp: Utils.dayTimestamp($scope.date),
				activity_type: $scope.activityType,
			};
			if ($scope.calories) datum['calories'] = $scope.calories;

			$scope.submitting = true;
			Popover.lock();
			$http.post('/data/o/exercise', datum)
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
