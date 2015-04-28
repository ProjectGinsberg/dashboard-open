angular.module('gb.dayByDay')
.controller('DayByDayController',
	['$scope', 'DataSeries', 'Sleep', 'Events', '$log',
		function($scope, DataSeries, Sleep, Events, $log) {

	var SERIES = ['alcohol', 'exercise', 'nutrition', 'sleep', 'social', 'steps'];

	var clearData = function() {
		_.forEach(SERIES, function(id) { $scope[id] = undefined; });
		$scope.tags = undefined;
		$scope.sleepQuality = undefined;
	};

	/**
	 * Copy data into the scope
	 */
	var loadData = function() {
		clearData();

		var options = {
			start: $scope.periodStart().toISOString(),
			end: $scope.periodUpperBound().toISOString(),
			interpolate: 'linear',
			window: 'day'
		};
		_.forEach(SERIES,
			function(id) {
				DataSeries.get(_.extend({series: id}, options), function(data) {
					//$log.log(id + " data", data.data);
					$scope[id] = data;
				});
			}
		);
		// FIXME: This should just be a backend data series
		Events.query({start: options.start, end: options.end},
			function(data) {
				// This is a horrible algorithm, but the data volumes are so low
				// it shouldn't matter in practice
				//$log.log("Processing events", data);
				var tags = _.map($scope.periodSelection(), function(day) {
					var tags = [];
					_.forEach(data, function(evt) {
						if (new moment(evt.timestamp).local().isSame(day, "day")) {
							tags = _.union(tags, evt.tags);
						}
					});
					return tags;
				});
				$scope.tags = tags;
		});

		// FIXME: This should just be backend data series
		Sleep.query({start: options.start, end: options.end},
			function(data) {
				// As above, horrible algorithm. Should work okay.
				//$log.log("Processing sleep quality", data);
				var sleepQuality = _.map($scope.periodSelection(), function(day) {
					var quality = undefined;
					// Get the first data point for each day
					_.forEach(data, function(d) {
						if (angular.isDefined(quality)) return;
						if (!angular.isDefined(d.quality)) return;
						if (new moment(d.timestamp).local().isSame(day, "day")) {
							quality = d.quality.value;
							$log.log('SD', day, d);
						}
					});
					$log.log("SQ", day, quality);
					return quality;
				});
				$scope.sleepQuality = sleepQuality;
			}
		);
	};

	$scope.$watch('periodSelection()', loadData);

}]);
