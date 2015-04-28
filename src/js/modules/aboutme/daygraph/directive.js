angular.module('gb.aboutMe')
.directive('dayGraph',function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) { },
		templateUrl: '/app/partials/aboutme/daygraph.html'
	};
});