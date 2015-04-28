angular.module('gb.thisWeek')
.directive('totalWeek',
  function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {

		},
		templateUrl: '/app/partials/this-week/totalweek.html'
	};
});
