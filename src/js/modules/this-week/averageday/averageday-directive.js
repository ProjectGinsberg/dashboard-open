angular.module('gb.thisWeek')
.directive('averageDay',
  function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) { 
			
		},
		templateUrl: '/app/partials/this-week/averageday.html'
	};
});