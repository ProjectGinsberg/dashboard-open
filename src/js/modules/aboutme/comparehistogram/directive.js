angular.module('gb.aboutMe')
.directive('compareHistogram', function() {
	return {
		restrict: 'E',
		link: function link(scope, element, attrs) { },
		templateUrl: '/app/partials/aboutme/comparehistogram.html'
	};
});