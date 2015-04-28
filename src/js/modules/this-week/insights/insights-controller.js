angular.module('gb.thisWeek')
.controller('InsightsController',
	['$scope','Correlations',function($scope,Correlations) {
		$scope.insights = null;
		Correlations.getInsights('steps').then(function(d) {
			var insights = [];
			_.each(d,function(d) {
				insights.push(d.body.insight);
			});
			$scope.insights = insights;
		});
	}]);
