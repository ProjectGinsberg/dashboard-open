angular.module('gb.thisWeek')
.controller('AverageDayController', ['$scope', 'Stats','DataSeries','ThisWeekPeriodSelection',
function($scope, Stats,DataSeries,ThisWeekPeriodSelection) {
	var metrics = ['sleep', 'steps', 'nutrition', 'exercise', 'alcohol', 'social'];
	metrics.map(function(m) {
		$scope.$watch(m+'DataSeries',function(newVal) {

		});
		$scope.$watch(m+'Mean',function(newVal) {

		});
		$scope.$watch(m+'DataSeries',function(newVal) {

		});
	})
	var getForPeriod = function(period) {
		var startDate = period.start,
		endDate = period.end;
		// set up average and total values
		// pull in all the time series for the date period
		metrics.map(function(m) {
			DataSeries.get({
				series: m,
				interpolate: 'rolling',
				window: 'day',
				start: endDate,
				end: startDate,
			}, function(timeSeries) {
				$scope[m+'DataSeries'] = timeSeries;
			});
		});
		// pull in all the stats for the date period
		metrics.map(function(m) {
			Stats.get({
				series: m,
				start: endDate,
				end: startDate,
			}, function(data) {
				if (data.count > 0) {
					$scope[m + 'Mean'] = Math.floor(data.mean);
				} else {
					$scope[m + 'Mean'] = undefined;
				}

				if (data.count > 0) {
					$scope[m + 'Total'] = Math.floor(data.max);
				} else {
					$scope[m + 'Total'] = undefined;
				}
			});
		});
		$scope.isDefined = function(v) {
			if (typeof $scope[v] === 'undefined') return false;
			return true;
		}
	};

	var period = ThisWeekPeriodSelection.getPeriod();
	$scope.ThisWeekPeriodSelection = ThisWeekPeriodSelection;
	//$scope.$watch('ThisWeekPeriodSelection');
	$scope.$watch('ThisWeekPeriodSelection.getPeriod()',function(newVal)
	{
		getForPeriod(newVal);
	},true);


}]);
