// FIXME: Quick inspection suggests this is could use some reworking
// For a start there's a surprising amount of code here...
controllers.controller('SleepController', ['Sleep', '$scope', '$http', '$q', '$route', '$log', 'Popover', 'Utils',
	function SleepController(Sleep, $scope, $http, $q, $route, $log, Popover, Utils) {
		'use strict';

		//sleep can be added without time
		$scope.bedTime = '23:00';
		$scope.wakeTime = '06:00';

		$scope.loading = false;
		$scope.submitting = false;
		$scope.error = '';

		$scope.submit = function() {
			$scope.submitting = true;

			// There has to be a better way! Possibly using a different lib
			var today = moment();
			var bedTime = moment(today.format('YYYY-MM-DD ') + $scope.bedTime);
			var wakeTime = moment(today.format('YYYY-MM-DD ') + $scope.wakeTime);
			if (!bedTime.isBefore(wakeTime)) bedTime.subtract(1, 'day');

			var totalSleep = wakeTime.diff(bedTime, 'minutes');

			var datum = {
				'timestamp': Utils.dayTimestamp($scope.date),
				'total_sleep': totalSleep,
				'quality': {
					'value': parseInt($scope.sleepQuality)
				}
			};

			Popover.lock();
			$scope.submitting = true;
			$http.post('/data/o/sleep', datum)
				.success(function(data, status, headers, config) {
					$scope.fetchGraphData();
					Popover.unlock();
					$scope.hide();
					$scope.submitting = false;

				})
				.error(function(data, status, headers, config) {
					$scope.error = 'FAILED! Please reload the page and try again';
				});
		};

		$scope.update = function() {
			var quality = parseInt($scope.sleepQuality);
			Popover.lock();
			$scope.submitting = true;
			$q.all(_.map($scope.data, function(datum) {
				if (!datum.quality) datum.quality = {};
				datum.quality.value = quality;
				return datum.$save();
			})).then(
				//success
				function() {
					Popover.unlock();
					$scope.hide();
					$scope.submitting = false;
					$scope.fetchGraphData();
				},
				//error
				function(e) {
					$scope.error = 'FAILED! Please reload the page and try again';
					Popover.unlock();
					$scope.hide();
					$scope.submitting = false;
				}
			);
		};

		$scope.delete = function(datum) {
			datum.$delete(function() {
				$scope.hide();
				$scope.fetchGraphData();
			});
		};

		var load = function(date) {
			// How can this happen?
			if (!angular.isDefined(date)) {
				return;
			}
			$scope.data = [];
			$scope.sleepQuality = undefined;
			$scope.loading = true;

			// FIXME: Consider moving the start backwards...
			// FIXME: This window should exactly match the (shifted) window
			// that the backend data series use.
			var start = Utils.startOfDay(date).add(-6, 'hours').toISOString();
			var end = Utils.startOfDay(date).add(12, 'hours').add(-1, 'second').toISOString();
			$log.log("Fetching sleep data", start, end);
			Sleep.query({
				start: start,
				end: end
			})
			.$promise
			.then(function(data) {
				$log.log('Loaded sleep data', data);
				$scope.sleepQuality = data.length > 0 && data[0].quality ? data[0].quality.value : undefined;
				$scope.data = data;
				$scope.loading = false;
			}, function(e) {
				$log.error(e);
				$scope.loading = false;
				// And?
			});
		};

		$scope.$watch('sleepDeleteDate', load);
	}
]);
