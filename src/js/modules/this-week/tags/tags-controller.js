angular.module('gb.thisWeek')
.controller('TagsController',
	['$scope','Events','Tags','ThisWeekPeriodSelection', function($scope,Events,Tags,
																	ThisWeekPeriodSelection) {
		$scope.ThisWeekPeriodSelection = ThisWeekPeriodSelection;
		//$scope.$watch('ThisWeekPeriodSelection');
		$scope.$watch('ThisWeekPeriodSelection.getPeriod()',function(newVal)
		{
			getForPeriod(newVal);
		},true);
		var getForPeriod = function(period) {
			var startDate = period.start,
				endDate = period.end;

			Tags.get({
				start: endDate,
				end: startDate,
			},
			function(data) {
				// find out the max tag score
				var max = Number.MIN_VALUE;
				_.each(data.tags,function(t) {
					var count = t.count;
					if (count > max)
						max = count;
					});
					$scope.maxTagCount = max;
					$scope.tags = data.tags;
				},function(e) {

				});
		};
}]);
