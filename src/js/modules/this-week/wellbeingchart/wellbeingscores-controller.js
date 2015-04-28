angular.module('gb.thisWeek')
.controller('WellbeingScoresController',
	['$scope','WellbeingService','ThisWeekPeriodSelection',function($scope,
																	WellbeingService,
																	ThisWeekPeriodSelection) {
		var getForPeriod = function(period) {
			WellbeingService.getWellbeingScores(period.start,
				period.end,
				function(data) {
					$scope.wellbeingScores = data;
				});
		};
		//$scope.ThisWeekPeriodSelection = ThisWeekPeriodSelection;
		//$scope.$watch('ThisWeekPeriodSelection');
		getForPeriod(ThisWeekPeriodSelection.getPeriod());
		/*$scope.wellbeingScores = [{ "wellbeingId": 1,
                 "wellbeingDescription":"hello",
                 "scores":[{
			score: 1,
			count:0
		},{
			score: 2,
			count:0
		},{
			score: 3,
			count:0
		},{
			score: 4,
			count:2
		},{
			score: 5,
			count:5
		}]},{ "wellbeingId": 2,
                 "wellbeingDescription":"world",
                 "scores":[{
			score: 1,
			count:5
		},{
			score: 2,
			count:1
		},{
			score: 3,
			count:1
		},{
			score: 4,
			count:0
		},{
			score: 5,
			count:0
		}]},{ "wellbeingId": 3,
                 "wellbeingDescription":"world",
                 "scores":[{
			score: 1,
			count:0
		},{
			score: 2,
			count:1
		},{
			score: 3,
			count:5
		},{
			score: 4,
			count:1
		},{
			score: 5,
			count:0
		}]}];*/
}]);
