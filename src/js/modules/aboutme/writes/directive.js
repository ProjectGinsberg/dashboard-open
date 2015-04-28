angular.module('gb.aboutMe')
.directive('writes', function() {
	return {
		restrict: 'E',
		link: function(scope,element,attrs) {

		},
		templateUrl: '/app/partials/aboutme/writes.html'
	}
});