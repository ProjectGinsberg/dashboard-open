angular.module('gb.todayOnGinsberg')
.controller('TodayOnGinsbergController', ['$scope', 'Stats', function($scope, Stats) {

	var today = moment().startOf('day').toISOString();
	var last24hours = moment().add(-24, 'hours').toISOString();
	var thisWeek = moment().startOf('week').toISOString();

	$scope.sleep = Stats.get({series: 'sleep', start: today, scope: 'everyone'});
	$scope.steps = Stats.get({series: 'steps', start: today, scope: 'everyone'});
	$scope.alcohol = Stats.get({series: 'alcohol', start: last24hours, scope: 'everyone'});

	$scope.wellbeing = Stats.get({series: 'wellbeing', start: today, scope: 'everyone'});

	$scope.weekly = {
		sleep: Stats.get({series: 'sleep', start: thisWeek, scope: 'everyone'}),
		steps: Stats.get({series: 'steps', start: thisWeek, scope: 'everyone'}),
		alcohol: Stats.get({series: 'alcohol', start: thisWeek, scope: 'everyone'}),
		wellbeing: Stats.get({series: 'wellbeing', start: thisWeek, scope: 'everyone'}),
	};

}]);
