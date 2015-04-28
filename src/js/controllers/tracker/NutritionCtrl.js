controllers.controller('NutritionController', ['$scope', '$log', '$http', '$route', 'Popover', 'Utils',
	function NutritionController($scope, $log, $http, $route, Popover, Utils) {
		'use strict';

		var NUTRITION_UPPER_LIMIT = 10000;

		$scope.nutrition = '';
		$scope.calories = 0;
		$scope.submitting = false;
		$scope.error = '';

		$scope.isDefined = function(v) {
			var defined = angular.isDefined(v);
			var empty;
			if (defined)
				empty = !(eval("$scope." + v) || eval("$scope." + v) == 0);
				return (defined && !empty);
			}

		$scope.disableSubmit = function() {
			var canSubmit = ($scope.nutrition);
			return !canSubmit;
		};

		$scope.submit = function() {
			var datum = {
				'timestamp': Utils.dayTimestamp($scope.date),
				'calories': $scope.calories
				//'mood': $scope.currentMood()
			};
			if (datum.calories > NUTRITION_UPPER_LIMIT) {
				$scope.error = 'Please double check your calories entry as it appears to be too high.';
				return;
			} else if (isNaN(parseFloat(datum.calories)) && !isFinite(datum.calories)){
				$scope.error = 'Calories must be entered as a numeric value between 0 and 10,000';
				return;
			} else {
				$scope.error = '';
			}
			$scope.submitting = true;
			Popover.lock();
			// FIXME: Use service
			$http.post('/data/o/nutrition', datum)
				.success(function(data, status, headers, config) {
					$scope.fetchGraphData();
				})
				.error(function(data, status, headers, config) {
					$scope.error = 'FAILED! Please reload the page and try again';
				}).then(function() {
					Popover.unlock();
					$scope.hide();
					$scope.submitting = false;
				});
		};

		$scope.moods = [{
			text: 'Bad',
			selected: false,
			value: 20
		}, {
			text: 'Meh',
			selected: false,
			value: 40
		}, {
			text: 'Ok',
			selected: false,
			value: 60
		}, {
			text: 'Good',
			selected: false,
			value: 80
		}, {
			text: 'Great',
			selected: false,
			value: 100
		}];

		$scope.changeMood = function(moodText) {
			angular.forEach($scope.moods, function(mood) {
				mood.selected = (mood.text === moodText);
			});
		};

		$scope.currentMood = function() {
			var curMood = 0;
			angular.forEach($scope.moods, function(mood) {
				if (mood.selected) curMood = mood.value;
			});
			return curMood;
		};
	}
])
