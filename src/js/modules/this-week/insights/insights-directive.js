angular.module('gb.thisWeek')
.directive('insights',['$sce',
  function($sce) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) { 
			scope.trusted = function(html) {
				return $sce.trustAsHtml(html);
			};
		},
		templateUrl: '/app/partials/this-week/insights.html'
	};
}]);